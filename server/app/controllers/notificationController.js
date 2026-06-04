const Notification = require("../models/notification");
const mongoose = require("mongoose");

class NotificationController {

  
  async getMyNotifications(req, res) {
    try {
    
      const userId = req.user.id;
      const userRole = req.user.role; 

      const notifications = await Notification.find({
        $or: [
          // 1. GLOBAL ANNOUNCEMENTS --//
          { isGlobal: true },

         
          { 
            receiverId: userId, 
            receiverModel: userRole 
          },
        ],
      })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: notifications.length,
        data: notifications,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  }


  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      // Find the notification first to verify ownership
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

    
      if (!notification.isGlobal && notification.receiverId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this notification",
        });
      }

      // Perform update safely
      notification.isRead = true;
      await notification.save();

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update notification",
        error: error.message,
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      
      if (
        userRole !== "Admin" && 
        notification.receiverId && 
        notification.receiverId.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this notification",
        });
      }

      await notification.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message,
      });
    }
  }

  async getAllNotifications(req, res) {
    try {
      const notifications = await Notification.find()
        .populate("receiverId")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: notifications.length,
        data: notifications,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  }
}

module.exports = new NotificationController();


