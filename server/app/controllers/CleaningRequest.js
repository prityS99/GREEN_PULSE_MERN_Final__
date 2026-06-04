const CleaningRequest = require("../models/cleaningRequest");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

class CleaningRequestController {
  
  // 🚀 1. CENTRALIZED CREATE METHOD
  async createRequest(req, res) {
    try {
      console.log("=== DEBUG REQ.FILES ===", req.files);
      console.log("=== DEBUG REQ.BODY ===", req.body);

      // Access parameters straight from the token and the form fields
      const userId = req.user.id; 
      const role = req.user.role; // e.g., "ngo"
      const { location, wasteType, description, companyId, status } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "You must specify a targeted partner Cleaning Company ID.",
        });
      }

      // Handle array format validation cleanly
      let parsedWasteType = ["mixed"];
      if (wasteType) {
        if (typeof wasteType === "string" && wasteType.startsWith("[")) {
          parsedWasteType = JSON.parse(wasteType);
        } else if (Array.isArray(wasteType)) {
          parsedWasteType = wasteType;
        } else {
          parsedWasteType = [wasteType];
        }
      }

      // Upload binary buffers to Cloudinary & clean server cache tracks
      let imageObjects = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "Green_Pulse_MERN",
            });
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return { url: result.secure_url };
          } catch (err) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            throw err;
          }
        });
        imageObjects = await Promise.all(uploadPromises);
      }

      // Create request entry directly
      const cleaningRequest = await CleaningRequest.create({
        userId, // Stored directly from JWT
        location,
        description,
        wasteType: parsedWasteType,
        images: imageObjects,
        companyId, // Stored directly from frontend selection
        status: status || "pending",
      });

      return res.status(201).json({
        success: true,
        message: "Cleaning request dispatched successfully!",
        data: cleaningRequest,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🚀 2. DYNAMIC READ METHOD FOR ALL ROLES
  async getARequests(req, res) {
    try {
      const userId = req.user.id;
      const role = req.user.role.toLowerCase(); // Normalization guard
      let query = {};

      // Filter feeds dynamically using the JWT profile strings alone
      if (role === "ngo") {
        query = { userId: userId }; // Creator view feed tracking
      } 
      else if (role === "cleaning_company" || role === "cleaningcompany") {
        query = { companyId: userId }; // Assigned vendor view feed tracking
      }
      // If role is admin or govtOfficer, query stays empty {} to view all logs globally

      const requests = await CleaningRequest.find(query).sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: requests });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🚀 3. UNIVERSAL PATCH PROGRESS STATUS METHOD
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedRequest = await CleaningRequest.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!updatedRequest) {
        return res.status(404).json({ success: false, message: "Request log entry not found." });
      }

      return res.status(200).json({
        success: true,
        message: `Status transitioned to ${status} cleanly.`,
        data: updatedRequest,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CleaningRequestController();