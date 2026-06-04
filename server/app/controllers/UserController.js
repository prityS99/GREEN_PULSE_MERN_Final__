const User = require("../models/users");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const imagekit = require("../config/cloudinary");

class UserController {

  // -- GET PROFILE --- // 
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: user,
      });
    } catch (error) {
      console.log("Get Profile Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  // -- UPDATE PROFILE -- // 
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;

      const { name, phone, address, bio } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name,
          phone,
          address,
          bio,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.log("Update Profile Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  // -- DELETE PROFILE -- //
  async deleteProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Delete image from imagekit if exists
      if (user.profilePicture?.fileId) {
        await imagekit.deleteFile(user.profilePicture.fileId);
      }

      await User.findByIdAndDelete(userId);

      return res.status(200).json({
        success: true,
        message: "Profile deleted successfully",
      });
    } catch (error) {
      console.log("Delete Profile Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  
  // -- UPLOAD PROFILE PICTURE -- // 
  async uploadProfilePicture(req, res) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove old image from imagekit
      if (user.profilePicture?.fileId) {
        await imagekit.deleteFile(user.profilePicture.fileId);
      }

      const filePath = req.file.path;

      const uploadedImage = await imagekit.upload({
        file: fs.readFileSync(filePath),
        fileName: req.file.filename,
        folder: "/users",
      });

      user.profilePicture = {
        url: uploadedImage.url,
        fileId: uploadedImage.fileId,
      };

      await user.save();
      fs.unlinkSync(filePath);

      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: user.profilePicture,
      });
    } catch (error) {
      console.log("Upload Profile Picture Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }


  // -- USER DASHBOARD -- //
  async getUserDashboard(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId)
        .select("-password")
        .lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const dashboardData = {
        userInfo: {
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profilePicture?.url || null,
        },

        permissions: [
          "view_all_blogs",
          "update_comments",
          "delete_comments",
          "create_reviews",
          "update_reviews",
          "delete_reviews",
          "like_blogs",
          "comment_blogs",
        ],

        stats: {
          totalReviews: user.totalReviews || 0,
          totalComments: user.totalComments || 0,
          totalLikes: user.totalLikes || 0,
        },
      };

      return res.status(200).json({
        success: true,
        message: "User dashboard fetched successfully",
        data: dashboardData,
      });
    } catch (error) {
      console.log("User Dashboard Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = new UserController();