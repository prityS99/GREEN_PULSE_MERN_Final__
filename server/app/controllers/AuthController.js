const User = require("../models/users");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { getIO } = require("../sockets/socket");
const cloudinary = require("../config/cloudinary");
const { sendCredentialsEmail } = require("../services/mail/emailService");
const { signupValidation, loginValidation } = require("../joiValidations/joi");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const tokenModel = require("../models/token");

class AuthController {
  // ----- SIGNUP ------ //

  async signup(req, res) {
    try {
      // 1. Validate Text Data First (Ensure profileImage is removed from your Joi schema if it was there)
      const { error } = signupValidation.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          errors: error.details.map((err) => err.message),
        });
      }

      const { name, email, password, role } = req.body;

      // 2. Check for existing registration
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiry = Date.now() + 1000 * 60 * 60; // 1 hour window

      // 3. Save to DB (profileImage object is cleanly removed)
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        verificationToken,
        verificationExpiry,
      });

      // 4. Set up endpoints for real-time validation via backend
      const backendBase = "http://localhost:4002";
      const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";

      const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      const loginURL = `${process.env.FRONTEND_URL}/login`;

      await sendCredentialsEmail(
        email,
        "Verify Your Email & Welcome to Green Pulse",
        `
        <h2 style="color: #2E8B57; margin-top: 0; text-align: center; font-size: 22px;">Hello ${name},</h2>
        <p style="text-align: center; color: #555555; font-size: 15px;">
          Welcome to your Green Pulse Foundation! Please click the button block below to securely verify your account:
        </p>
        <div style="background-color: #2E8B57; background-image: linear-gradient(135deg, #2E8B57 0%, #9370DB 100%); padding: 25px; text-align: center; border-radius: 8px; margin: 30px 0;">
          <a href="${verifyURL}" style="font-size: 20px; font-weight: bold; color: #ffffff !important; text-decoration: none !important; display: inline-block; letter-spacing: 0.5px;">
            CONFIRM EMAIL NOW &rarr;
          </a>
        </div>
        <p style="text-align: center; font-size: 14px; color: #666666; margin-top: 20px;">
          Already confirmed? <a href="${loginURL}" style="color: #9370DB; font-weight: bold; text-decoration: underline;">Click here to access your Login Portal</a>
        </p>
        <div style="margin-top: 35px; border-top: 1px dashed #dddddd; padding-top: 15px; font-size: 11px; color: #999999; text-align: center; line-height: 1.4;">
          If the action link button doesn't work, manually navigate here:<br>
          <a href="${verifyURL}" style="color: #9370DB; word-break: break-all;">${verifyURL}</a>
        </div>
      `,
      );

      // 6. Send structural JSON feedback back to client application
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.status(201).json({
        success: true,
        message: "Signup successful. Verification email has been sent.",
        user: userResponse,
      });
    } catch (error) {
      console.error("Signup Error: ", error);
      res.status(500).json({
        success: false,
        message: "Signup Failed",
      });
    }
  }

  // ---- VERIFY EMAIL ---- //
  async verifyMail(req, res) {
    try {
      const { token } = req.params;
      const user = await User.findOne({
        verificationToken: token,
        verificationExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationExpiry = undefined;
      await user.save();

      res
        .status(200)
        .json({ success: true, message: "Email Verified Successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Verification Failed" });
    }
  }

  // ---- LOGIN ----- //
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 1️⃣ Check user exists
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // 2️⃣ Check verification
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email first",
        });
      }

      // 3️⃣ Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid password",
        });
      }

      // 4️⃣ Generate tokens
      const accessToken = generateAccessToken({
        _id: user._id,
        role: user.role,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        _id: user._id,
      });

      // 5️⃣ Save refresh token in DB
      await tokenModel.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // 6️⃣ Set cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 15, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      // 7️⃣ Response
      return res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- REFRESH TOKEN ---- //
  async refreshToken(req, res) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Refresh token missing" });
      }

      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User session not found" });
      }

      const accessToken = generateAccessToken(user);

      // Overwrite previous access cookie signature dynamically
      res.cookie("accessToken", accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      // Pure cookie setup: return success status confirmation without the token string payload
      res.status(200).json({ success: true });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }
  }

  // ----- FORGOT PASSWORD ----- //
// ----- FORGOT PASSWORD (AUTO-GENERATE TEMPORARY PASSWORD) ----- //
async forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Generate a random temporary password (e.g., 10 alphanumeric characters)
    const tempPassword = crypto.randomBytes(5).toString("hex"); 

    // 3. Hash the temporary password before saving to the DB
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    
    user.password = hashedTempPassword;
    // Optional: flag that they should probably change this later upon successful login
    if(user.isTemporaryPassword !== undefined) {
      user.isTemporaryPassword = true;
    }
    
    await user.save();

    // 4. Send email containing the plain-text auto-generated password
    const loginURL = `${process.env.FRONTEND_URL}/login`;

    await sendCredentialsEmail(
      email,
      "Your Temporary Green Pulse Password",
      `
      <h2 style="color: #2E8B57;">Hello ${user.name},</h2>
      <p>We received a request to reset your password. A temporary password has been generated for you:</p>
      
      <div style="background-color: #f4f4f4; padding: 15px; font-family: monospace; font-size: 18px; text-align: center; border: 1px solid #ddd; letter-spacing: 2px; margin: 20px 0;">
        <strong>${tempPassword}</strong>
      </div>
      
      <p>Please use this password to log into your account. For your security, we recommend changing it immediately after logging in.</p>
      <p><a href="${loginURL}" style="color: #9370DB; font-weight: bold;">Go to Login Portal</a></p>
      `
    );

    res.status(200).json({ 
      success: true, 
      message: "A temporary auto-generated password has been sent to your email." 
    });

  } catch (error) {
    console.error("Forgot password error: ", error);
    res
      .status(500)
      .json({ success: false, message: "Forgot password operation failed" });
  }
}

  // ----- RESET PASSWORD ----- //
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      }

      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();

      res
        .status(200)
        .json({ success: true, message: "Password reset successful" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Reset password failed" });
    }
  }

  // ---- DASHBOARDS CORRECTION MAPPINGS ---- //
  async adminDashboard(req, res) {
    res.status(200).json({ success: true, user: req.user });
  }
  async userDashboard(req, res) {
    res.status(200).json({ success: true, user: req.user });
  }
  async cleaningCompanyDashboard(req, res) {
    res.status(200).json({ success: true, user: req.user });
  }
  async govtOfficerDashboard(req, res) {
    res.status(200).json({ success: true, user: req.user });
  }
  async ngoDashboard(req, res) {
    try {
      const ngoProfile = await NGO.findOne({ userId: req.user.id }).sort({
        createdAt: -1,
      });

      if (!ngoProfile) {
        return res.status(404).json({
          success: false,
          message: "No NGO profile found for this account.",
        });
      }

      res.status(200).json({
        success: true,
        ngo: ngoProfile,
        user: req.user, // keeping user info context available just in case
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Dashboard data fetch failed",
        error: error.message,
      });
    }
  }
  // ------ PROFILE ------ //
  async profile(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: "Profile Fetch Failed" });
    }
  }

  // ----- UPDATE PROFILE IMAGE ----- //
 async updateProfile(req, res) {
  try {
    const { name, email, address, password } = req.body;
    
    // 1. Find user from authentication middleware token context
    const user = await User.findById(req.user.id);
    if (!user) {
      // Clean up uploaded local file if user doesn't exist
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ==========================================
    // PHASE 1: TEXT DATA UPDATES (inc. PASSWORD)
    // ==========================================
    if (name) user.name = name;
    
    if (address !== undefined) user.address = address;

    // Check if user wants to change their email and handle validation
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ success: false, message: "Email is already in use" });
      }
      user.email = email;
    }

    // Check if password exists in payload, then hash it
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    // ==========================================
    // PHASE 2: MULTIPART PROFILE IMAGE UPLOAD
    // ==========================================
    if (req.file) {
      // If user already has an avatar image asset inside Cloudinary, destroy the old one first
      if (user.profileImage && user.profileImage.profileImageId) {
        await cloudinary.uploader.destroy(user.profileImage.profileImageId);
      }

      // Upload new file asset to Cloudinary bucket
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Green_Pulse_MERN",
      });

      // Update schema context references
      user.profileImage = {
        url: result.secure_url,
        profileImageId: result.public_id,
      };

      // Wipe out temp storage local copy from server disk instantly
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    // Save all modifications to MongoDB safely
    await user.save();

    // Remove password string from output confirmation frame
    const userResponse = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile configuration updated successfully",
      user: userResponse,
    });

  } catch (error) {
    // Fail-safe cleaner run to remove dangling un-handled server images
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Profile Update Error: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile configurations" });
  }
}

  async getMe(req, res) {
    try {
      const token = req.cookies.access_token;

      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.userId || decoded.id).select(
        "-password",
      );

      if (!user) {
        return res.status(404).json({ message: "User no longer exists" });
      }

      res.json({
        success: true,
        user: user,
      });
    } catch (err) {
      res.clearCookie("access_token");
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }
  // ----- LOGOUT ----- //
  async logout(req, res) {
    try {
      const COOKIE_OPTIONS = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Must match login setup
        path: "/", // Crucial: must be exactly the same as login
      };

      // Clear every potential cookie name you might have used
      res.clearCookie("token", COOKIE_OPTIONS);
      res.clearCookie("accessToken", COOKIE_OPTIONS);
      res.clearCookie("refreshToken", COOKIE_OPTIONS);

      return res.status(200).json({
        success: true,
        message: "Logout Successful",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
