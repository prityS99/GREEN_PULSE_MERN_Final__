// // controllers/refreshController.js
// const User = require("../models/admin"); // or however you import User
// const tokenModel = require("../models/token");
// const { generateAccessToken } = require("../utils/generateToken");



// class RefreshController {
//   async refresh(req, res) {
//     try {
//       const refreshToken = req.cookies.refresh_token;

//       if (!refreshToken) {
//         return res.status(401).json({
//           success: false,
//           message: "Refresh token required",
//         });
//       }

//       const dbToken = await tokenModel.findOne({ token: refreshToken });
//       if (!dbToken) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid token",
//         });
//       }

//       if (dbToken.expiresAt && dbToken.expiresAt < new Date()) {
//         return res.status(401).json({
//           success: false,
//           message: "Token expired",
//         });
//       }

//       const user = await User.findById(dbToken.userId);
//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: "User not found",
//         });
//       }

//       const newAccessToken = generateAccessToken({
//         userId: dbToken.userId,
//         role: user.role,
//       });

//       res.cookie("access_token", newAccessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         maxAge: 1000 * 10,
//       });

//       res.json({
//         success: true,
//         message: "Access token refreshed",
//       });
//     } catch (error) {
//       console.error("Refresh error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Refresh failed",
//       });
//     }
//   }
// }

// module.exports = new RefreshController();
