const mongoose = require('mongoose')
const Notification = require("../models/notification");
const { getIO } = require("../sockets/socket");

class AnnouncementController {

  async createGlobalAnnouncement(req, res) {
    try {
      const { title, message } = req.body;

      const globalNotif = await Notification.create({
        title,
        message,
        type: "announcement",
        isGlobal: true,
        createdBy: req.user.id,
        creatorModel: "User", 
      });

      // Broadcast globally to everyone connected across all dashboards
      const io = getIO();
      io.emit("new_notification", globalNotif);

      return res.status(201).json({ 
        success: true, 
        message: "Announcement created and broadcasted successfully", 
        data: globalNotif 
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }


  async editAnnouncement(req, res) {
    try {
      const { id } = req.params;

      const announcement = await Notification.findOne({ _id: id, isGlobal: true });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: announcement,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }


  async updateAnnouncement(req, res) {
    try {
      const { id } = req.params;
      const { title, message, type } = req.body;

      // Find and update the announcement only if it is a global announcement
      const updatedNotif = await Notification.findOneAndUpdate(
        { _id: id, isGlobal: true },
        { 
          title, 
          message, 
          type: type || "announcement" 
        },
        { new: true, runValidators: true }
      );

      if (!updatedNotif) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found or unauthorized to update",
        });
      }

      // REAL-TIME: Emit update event to all connected dashboards to replace old values
      const io = getIO();
      io.emit("update_notification", updatedNotif);

      return res.status(200).json({
        success: true,
        message: "Announcement updated and synchronized successfully",
        data: updatedNotif,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }


  async deleteAnnouncement(req, res) {
    try {
      const { id } = req.params;

      const announcement = await Notification.findOneAndDelete({ _id: id, isGlobal: true });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found or already deleted",
        });
      }

      // REAL-TIME: Notify frontends to instantly filter out this ID from their UI states
      const io = getIO();
      io.emit("delete_notification", id);

      return res.status(200).json({
        success: true,
        message: "Announcement permanently deleted and cleared from all dashboards",
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AnnouncementController();