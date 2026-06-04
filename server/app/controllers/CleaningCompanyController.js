const mongoose = require("mongoose");
const CleaningCompany = require("../models/cleaningCompany");
const CleaningRequest = require("../models/cleaningRequest");
const Review = require("../models/review");
const User = require("../models/users");
const cloudinary = require("../config/cloudinary");
const { sendCompanyAcceptedEmail } = require("../services/mail/emailService");
const { getIO } = require("../sockets/socket"); //
const fs = require("fs");

class CleaningCompanyController {
  
  // ---- ADD CLEANING COMPANY ----- //
  async addCleaningCompany(req, res) {
    try {
      const userId = req.user.id;

      const {
        companyName,
        about,
        licenseNumber,
        workersCount,
        phone,
        address,
        city,
        state,
        country,
        experienceYears,
      } = req.body;

      // check existing company
      const existingCompany = await CleaningCompany.findOne({ userId });
      if (existingCompany) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Company profile already exists",
        });
      }

      const existingLicense = await CleaningCompany.findOne({ licenseNumber });
      if (existingLicense) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "License number already exists",
        });
      }

      let coverImageData = undefined;

      // Handle cover image integration if uploaded
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "Green_Pulse_MERN",
        });

        coverImageData = {
          url: uploadResult.secure_url,
          coverImageId: uploadResult.public_id,
        };

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }

      const company = await CleaningCompany.create({
        userId,
        companyName,
        about,
        licenseNumber,
        workersCount,
        phone,
        address,
        city,
        state,
        country,
        experienceYears,
        coverImage: coverImageData,
      });

      res.status(201).json({
        success: true,
        message: "Cleaning company created successfully",
        data: company,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Local file cleanup issue:", err);
        }
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- UPDATE CLEANING COMPANY ---- // 
  async updateCleaningCompany(req, res) {
    try {
      const userId = req.user.id;

      const company = await CleaningCompany.findOne({ userId });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      const updatedCompany = await CleaningCompany.findByIdAndUpdate(
        company._id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      res.status(200).json({
        success: true,
        message: "Company updated successfully",
        data: updatedCompany,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- DELETE CLEANING COMPANY --- // 
  async deleteCleaningCompany(req, res) {
    try {
      const userId = req.user.id;

      const company = await CleaningCompany.findOne({ userId });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      await CleaningCompany.findByIdAndDelete(company._id);

      res.status(200).json({
        success: true,
        message: "Company deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ================= GET OWN PROFILE ================= //
  async getMyCompanyProfile(req, res) {
    try {
      const company = await CleaningCompany.findOne({ userId: req.user.id })
        .populate({
          path: "userId",
          select: "name email",
        });

      if (!company) {
        return res.status(200).json({
          success: true,
          message: "No corporate workspace registered for this user account yet.",
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ================= GET OWN CLEANING REQUESTS ================= //
  async getCompanyCleaningRequests(req, res) {
    try {
      const company = await CleaningCompany.findOne({ userId: req.user.id });

      if (!company) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const requests = await CleaningRequest.find({ companyId: company._id })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: requests.length,
        data: requests,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- GET SINGLE COMPANY --- // 
  async getSingleCompany(req, res) {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing Company database ID format.",
        });
      }

      const company = await CleaningCompany.findById(id.trim())
        .populate({
          path: "userId",
          select: "name email profilePicture",
        });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: `Company not found in MongoDB for the provided ID: ${id}`,
        });
      }

      const companyData = {
        ...company.toObject(),
        ownerName: company.userId?.name || "N/A",
        ownerEmail: company.userId?.email || "N/A",
        ownerImage: company.userId?.profilePicture || null,
        userId: company.userId?._id || company.userId,
      };

      return res.status(200).json({
        success: true,
        data: companyData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- GET ALL COMPANIES ---- //
  async getAllCompanies(req, res) {
    try {
      const companies = await CleaningCompany.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "owner",
          },
        },
        {
          $unwind: "$owner",
        },
        {
          $project: {
            companyName: 1,
            about: 1,
            city: 1,
            state: 1,
            country: 1,
            workersCount: 1,
            completedProjects: 1,
            totalReviews: 1,
            points: 1,
            isApproved: 1,
            coverImage: 1,
            ownerName: "$owner.name",
            ownerEmail: "$owner.email",
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        total: companies.length,
        data: companies,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ------ ACCEPT CLEANING REQUEST --- //
  async acceptCleaningRequest(req, res) {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const company = await CleaningCompany.findOne({ userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile configuration not found",
      });
    }

    const request = await CleaningRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Cleaning request not found",
      });
    }

    // Update the request document references
    request.status = "accepted";
    request.companyId = company._id; // Syncing target reference standard
    request.assignedCompany = company._id;
    await request.save();

    // Push tracking back to company lists
    company.cleaningRequests.push(request._id);
    await company.save();

    // Populate document context (including role to check if it's an NGO) before broadcasting/mailing
    const populatedRequest = await request.populate([
      { path: "userId", select: "name email role" },
      { path: "companyId", select: "companyName phone" }
    ]);

    // --- EMIT REAL-TIME SIGNAL & SEND EMAIL ROUTING TO NGOs --- //
   // --- EMIT REAL-TIME SIGNAL & SEND EMAIL ROUTING TO NGOs --- //
try {
  const io = getIO();
  
  // 1. Broadcast layout update globally via WebSockets
  io.emit("cleaning_request_accepted", populatedRequest);

  // 2. Send a dedicated tracking dispatch specifically targeted to the NGO channels
  io.emit("ngo_msg_company_accepted", {
    message: `The cleaning group "${company.companyName}" has claimed the sanitation request at ${populatedRequest.location}.`,
    requestId: populatedRequest._id,
    data: populatedRequest
  });

  // 3. ✉️ TRIGGER THANK YOU & CONFIRMATION EMAIL DIRECTLY TO THE NGO
  // ✅ FIX: Safe, case-insensitive role verification string check
  if (
    populatedRequest.userId && 
    populatedRequest.userId.role && 
    populatedRequest.userId.role.toLowerCase() === "ngo"
  ) {
    await sendCompanyAcceptedEmail(populatedRequest.userId.email, populatedRequest);
    console.log(`Operational confirmation email sent successfully to NGO: ${populatedRequest.userId.email}`);
  } else {
    console.log("❌ Email skipped: User role does not resolve to 'ngo'. Current role value:", populatedRequest.userId?.role);
  }
  
} catch (notificationError) {
  console.error("Real-time notification or mailing system transmission issue:", notificationError.message);
} try {
      const io = getIO();
      
      // 1. Broadcast layout update globally via WebSockets
      io.emit("cleaning_request_accepted", populatedRequest);

      // 2. Send a dedicated tracking dispatch specifically targeted to the NGO channels
      io.emit("ngo_msg_company_accepted", {
        message: `The cleaning group "${company.companyName}" has claimed the sanitation request at ${populatedRequest.location}.`,
        requestId: populatedRequest._id,
        data: populatedRequest
      });

      // 3. ✉️ TRIGGER THANK YOU & CONFIRMATION EMAIL DIRECTLY TO THE NGO
      if (populatedRequest.userId && populatedRequest.userId.role === "NGO") {
        await sendCompanyAcceptedEmail(populatedRequest.userId.email, populatedRequest);
        console.log(`Operational confirmation email sent successfully to NGO: ${populatedRequest.userId.email}`);
      }
      
    } catch (notificationError) {
      console.error("Real-time notification or mailing system transmission issue:", notificationError.message);
    }

    res.status(200).json({
      success: true,
      message: "Cleaning request successfully accepted, notifications and thank-you email dispatched.",
      data: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

  // async acceptCleaningRequest(req, res) {

  //   try {
  //     const { requestId } = req.params;
  //     const userId = req.user.id;

  //     const company = await CleaningCompany.findOne({ userId });
  //     if (!company) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Company profile configuration not found",
  //       });
  //     }

  //     const request = await CleaningRequest.findById(requestId);
  //     if (!request) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Cleaning request not found",
  //       });
  //     }

  //     // Update the request document references
  //     request.status = "accepted";
  //     request.companyId = company._id; // Syncing target reference standard
  //     request.assignedCompany = company._id;
  //     await request.save();

  //     // Push tracking back to company lists
  //     company.cleaningRequests.push(request._id);
  //     await company.save();

  //     // Populate document context before broadcasting stream alerts
  //     const populatedRequest = await request.populate([
  //       { path: "userId", select: "name email" },
  //       { path: "companyId", select: "companyName phone" }
  //     ]);

  //     // --- EMIT REAL-TIME SIGNAL ROUTING TO NGOs --- //
  //     try {
  //       const io = getIO();
        
  //       // Broadcast layout update globally
  //       io.emit("cleaning_request_accepted", populatedRequest);

  //       // Send a dedicated tracking dispatch specifically targeted to the NGO channels
  //       io.emit("ngo_msg_company_accepted", {
  //         message: `The cleaning group "${company.companyName}" has claimed the sanitation request at ${populatedRequest.location}.`,
  //         requestId: populatedRequest._id,
  //         data: populatedRequest
  //       });
  //     } catch (socketError) {
  //       console.error("Socket dispatch synchronization issue:", socketError.message);
  //     }

  //     res.status(200).json({
  //       success: true,
  //       message: "Cleaning request successfully accepted, real-time message routed to NGO panels.",
  //       data: populatedRequest,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }



  // REJECT CLEANING REQUEST ------ //
  async rejectCleaningRequest(req, res) {
    try {
      const { requestId } = req.params;

      const request = await CleaningRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Cleaning request not found",
        });
      }

      request.status = "rejected";
      await request.save();

      res.status(200).json({
        success: true,
        message: "Cleaning request rejected",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ------ UPDATE CLEANING STATUS ---- // 
  async updateCleaningStatus(req, res) {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      const request = await CleaningRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Cleaning request not found",
        });
      }

      request.status = status;

      if (status === "completed") {
        const company = await CleaningCompany.findById(request.assignedCompany);
        if (company) {
          company.completedProjects += 1;
          company.points += 20;
          await company.save();
        }
      }

      await request.save();

      res.status(200).json({
        success: true,
        message: "Cleaning status updated",
        data: request,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- UPLOAD WORK PROOF ----- // 
  async uploadWorkProof(req, res) {
    try {
      const { requestId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload image",
        });
      }

      const request = await CleaningRequest.findById(requestId);
      if (!request) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: "Cleaning request not found",
        });
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "Green_Pulse_MERN/proofs",
      });

      request.workProof = uploadResult.secure_url;
      await request.save();

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(200).json({
        success: true,
        message: "Work proof uploaded successfully",
        image: uploadResult.secure_url,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -----  COMPANY REVIEW ---- //
  async companyReview(req, res) {
    try {
      const userId = req.user.id;
      const { companyId, rating, comment } = req.body;

      const review = await Review.create({
        userId,
        companyId,
        rating,
        comment,
      });

      await CleaningCompany.findByIdAndUpdate(companyId, {
        $inc: {
          totalReviews: 1,
          points: 5,
        },
      });

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: review,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CleaningCompanyController();