const NGO = require("../models/ngo");
const Campaign = require("../models/campaigns");
const CleaningRequest = require("../models/cleaningRequest");
const Review = require("../models/review");
const Badge = require("../models/badge");
const Certificate = require("../models/certificate");
const CleaningCompany = require("../models/cleaningCompany");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

class NGOController {
  // ---- ADD NGO PROFILE --- //
  async addNgo(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        if (req.file && fs.existsSync(req.file.path))
          fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "User ID not found in token payload",
        });
      }

      const existingNgo = await NGO.findOne({ userId });

      if (existingNgo) {
        if (req.file && fs.existsSync(req.file.path))
          fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "NGO profile already exists",
        });
      }

      let coverImageData = null;

      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "Green_Pulse_MERN",
        });

        coverImageData = {
          url: uploadResult.secure_url,
          coverImageId: uploadResult.public_id,
        };

        fs.unlinkSync(req.file.path);
      }

      const { ngoName, about, address, city, country, inaugurationDate } =
        req.body;

      // ✅ SAFE PARSING (THIS IS THE KEY FIX)
      let ngoType = [];
      let members = {
        children: 0,
        elders: 0,
        adults: 0,
      };
      try {
        if (!req.body.ngoType) {
          ngoType = ["environment"];
        } else if (typeof req.body.ngoType === "string") {
          const parsed = JSON.parse(req.body.ngoType);

          ngoType = Array.isArray(parsed) ? parsed : [parsed];
        } else if (Array.isArray(req.body.ngoType)) {
          ngoType = req.body.ngoType;
        } else {
          ngoType = ["environment"];
        }
      } catch {
        ngoType = ["environment"];
      }

      try {
        members =
          typeof req.body.members === "string"
            ? JSON.parse(req.body.members)
            : req.body.members || members;
      } catch {
        members = {
          children: 0,
          elders: 0,
          adults: 0,
        };
      }

      const ngo = await NGO.create({
        userId,
        ngoName,
        about,
        address,
        city,
        country,
        inaugurationDate,
        ngoType,
        members,
        coverImage: coverImageData,
      });

      return res.status(201).json({
        success: true,
        message: "NGO profile created successfully",
        data: ngo,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // --- UPDATE NGO --- //

  // async updateNgo(req, res) {
  //   try {
  //     const userId = req.user.id;

  //     // 1. Create a mutable copy of the body fields
  //     const updateData = { ...req.body };

  //     // 2. PARSE THE NGO TYPE ARRAY SAFELY
  //     if (updateData.ngoType) {
  //       try {
  //         updateData.ngoType = typeof updateData.ngoType === 'string'
  //           ? JSON.parse(updateData.ngoType)
  //           : updateData.ngoType;
  //       } catch (e) {
  //         return res.status(400).json({
  //           success: false,
  //           message: "Invalid format for ngoType array"
  //         });
  //       }
  //     }

  //     // 3. PARSE THE MEMBERS OBJECT SAFELY (Preventing a similar error next!)
  //     if (updateData.members) {
  //       try {
  //         updateData.members = typeof updateData.members === 'string'
  //           ? JSON.parse(updateData.members)
  //           : updateData.members;
  //       } catch (e) {
  //         return res.status(400).json({
  //           success: false,
  //           message: "Invalid format for members object"
  //         });
  //       }
  //     }
  //     if (!updatedNgo) {
  //   return res.status(404).json({
  //     success: false,
  //     message: "NGO profile not found",
  //   });
  // }

  //     // 4. Handle your Cloudinary image upload as usual
  //     if (req.file) {
  //       const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
  //         folder: "Green_Pulse_MERN",
  //       });

  //       updateData.coverImage = {
  //         url: cloudinaryResult.secure_url,
  //         coverImageId: cloudinaryResult.public_id,
  //       };

  //       fs.unlinkSync(req.file.path);
  //     }
  // if (req.file) {

  //   // delete old image first
  //   const existingNgo = await NGO.findOne({ userId });

  //   if (existingNgo?.coverImage?.coverImageId) {
  //     await cloudinary.uploader.destroy(
  //       existingNgo.coverImage.coverImageId
  //     );
  //   }

  //   const cloudinaryResult = await cloudinary.uploader.upload(
  //     req.file.path,
  //     {
  //       folder: "Green_Pulse_MERN",
  //     }
  //   );

  //   updateData.coverImage = {
  //     url: cloudinaryResult.secure_url,
  //     coverImageId: cloudinaryResult.public_id,
  //   };

  //   fs.unlinkSync(req.file.path);
  // }
  //   const updatedNgo = await NGO.findOneAndUpdate({ userId }, updateData, {
  //   returnDocument: 'after',
  //   runValidators: true,
  // });
  //     return res.status(200).json({
  //       success: true,
  //       message: "NGO updated successfully",
  //       data: updatedNgo,
  //     });

  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  async updateNgo(req, res) {
    try {
      const userId = req.user.id;
      const updateData = { ...req.body };
      if (updateData.ngoType) {
        try {
          updateData.ngoType =
            typeof updateData.ngoType === "string"
              ? JSON.parse(updateData.ngoType)
              : updateData.ngoType;
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid format for ngoType array",
          });
        }
      }

      if (updateData.members) {
        try {
          updateData.members =
            typeof updateData.members === "string"
              ? JSON.parse(updateData.members)
              : updateData.members;
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid format for members object",
          });
        }
      }

      if (req.file) {
        // find existing NGO first
        const existingNgo = await NGO.findOne({ userId });

        // delete old cloudinary image
        if (existingNgo?.coverImage?.coverImageId) {
          await cloudinary.uploader.destroy(
            existingNgo.coverImage.coverImageId,
          );
        }

        // upload new image
        const cloudinaryResult = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "Green_Pulse_MERN",
          },
        );

        updateData.coverImage = {
          url: cloudinaryResult.secure_url,
          coverImageId: cloudinaryResult.public_id,
        };

        // remove temp local file
        fs.unlinkSync(req.file.path);
      }

      const updatedNgo = await NGO.findOneAndUpdate({ userId }, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedNgo) {
        return res.status(404).json({
          success: false,
          message: "NGO profile not found",
        });
      }

      /* =====================================================
        SUCCESS RESPONSE
    ===================================================== */

      return res.status(200).json({
        success: true,
        message: "NGO updated successfully",
        data: updatedNgo,
      });
    } catch (error) {
      console.error("UPDATE NGO ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ----- DELETE NGO ----- //
  async deleteNgo(req, res) {
    try {
      const userId = req.user.id;

      const deletedNgo = await NGO.findOneAndDelete({
        userId,
      });

      if (!deletedNgo) {
        return res.status(404).json({
          success: false,
          message: "NGO not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "NGO deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- GET SINGLE NGO ----- //
  // async getSingleNgo(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const ngo = await NGO.aggregate([
  //       {
  //         $match: {
  //           _id: require("mongoose").Types.ObjectId.createFromHexString(id),
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "userId",
  //           foreignField: "_id",
  //           as: "user",
  //         },
  //       },
  //       {
  //         $unwind: "$user",
  //       },
  //       {
  //         $project: {
  //           ngoName: 1,
  //           about: 1,
  //           address: 1,
  //           city: 1,
  //           state: 1,
  //           country: 1,
  //           ngoType: 1,
  //           isApproved: 1,
  //           coverImage: 1,
  //           createdAt: 1,
  //           "user.name": 1,
  //           "user.email": 1,
  //         },
  //       },
  //     ]);

  //     return res.status(200).json({
  //       success: true,
  //       data: ngo[0],
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  async getMyNgo(req, res) {
    try {
      // req.user.id comes straight from your JWT verification middleware
      const ngo = await NGO.findOne({ userId: req.user.id })
        .populate("badges")
        .populate("rewards")
        .populate("certificates")
        .populate({
          path: "userId",
          select: "name email",
        });

      if (!ngo) {
        // Return 200 with data: null so the frontend knows to show the "Setup Profile" screen
        return res.status(200).json({
          success: true,
          message: "No NGO workspace registered for this user yet.",
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        data: ngo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getSingleNgo(req, res) {
    try {
      const { id } = req.params;

      const ngo = await NGO.findById(id)
        .populate("badges")
        .populate("rewards")
        .populate("certificates")
        .populate({
          path: "userId",
          select: "name email",
        });

      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: "NGO not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: ngo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- GET ALL NGO --- //
  // async getAllNgo(req, res) {
  //   try {
  //     const ngos = await NGO.aggregate([
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "userId",
  //           foreignField: "_id",
  //           as: "user",
  //         },
  //       },
  //       {
  //         $unwind: "$user",
  //       },
  //       {
  //         $project: {
  //           ngoName: 1,
  //           city: 1,
  //           state: 1,
  //           country: 1,
  //           ngoType: 1,
  //           isApproved: 1,
  //           coverImage: 1,
  //           "user.name": 1,
  //           "user.email": 1,
  //         },
  //       },
  //       {
  //         $sort: {
  //           createdAt: -1,
  //         },
  //       },
  //     ]);

  //     return res.status(200).json({
  //       success: true,
  //       total: ngos.length,
  //       data: ngos,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  async getAllNgo(req, res) {
    try {
      const ngos = await NGO.find()
        .populate("badges")
        .populate("rewards")
        .populate("certificates")
        .populate({
          path: "userId",
          select: "name email",
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: ngos.length,
        data: ngos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- CREATE CAMPAIGN ---- //
  async createCampaign(req, res) {
    try {
      const userId = req.user.id;

      const ngo = await NGO.findOne({ userId });

      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: "NGO not found",
        });
      }

      const campaign = await Campaign.create({
        ngoId: ngo._id,
        ...req.body,
      });

      return res.status(201).json({
        success: true,
        message: "Campaign created successfully",
        data: campaign,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- UPDATE CAMPAIGN ---- //
  async updateCampaign(req, res) {
    try {
      const { id } = req.params;

      const updatedCampaign = await Campaign.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      return res.status(200).json({
        success: true,
        message: "Campaign updated successfully",
        data: updatedCampaign,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- DELETE CAMPAIGN ---- //
  async deleteCampaign(req, res) {
    try {
      const { id } = req.params;

      await Campaign.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Campaign deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


  // ---- GET OWN CAMPAIGN --- //
  
// ---- GET OWN CAMPAIGNS ---- //
async getOwnCampaigns(req, res) {
  try {
    const ngo = await NGO.findOne({
      userId: req.user.id,
    });

    if (!ngo) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const campaigns = await Campaign.find({
      ngoId: ngo._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

  // ---- CREATE CLEANING REQUEST ---- //

  async createCleaningRequest(req, res) {
    try {
      console.log("=== DEBUG REQ.FILES ===", req.files);
      console.log("=== DEBUG REQ.BODY ===", req.body);

      const userId = req.user?.id || req.user?._id;
      if (!userId) {
        // Safe cleanup if files arrived but auth context dropped
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
        }
        return res.status(400).json({
          success: false,
          message: "User ID not found in token payload",
        });
      }

      // 1. Locate the corresponding NGO profile document using the authenticated userId string
      const ngo = await NGO.findOne({ userId });
      if (!ngo) {
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
        }
        return res.status(404).json({
          success: false,
          message: "NGO workspace configuration profile not found",
        });
      }

      const { location, wasteType, description, companyId, status } = req.body;

      if (!companyId) {
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
        }
        return res.status(400).json({
          success: false,
          message: "You must specify a targeted partner Cleaning Company ID.",
        });
      }

      // 2. Safe Parsing layer for dynamic wasteType inputs
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

      // 3. Process cloud asset uploads & clean up server local disk storage caches
      let imageObjects = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "Green_Pulse_MERN",
            });
            
            // Delete local server file cache instantly after cloud upload finishes
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            return { url: result.secure_url };
          } catch (uploadErr) {
            // Cleanup local temp file even if Cloudinary fails
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            throw uploadErr;
          }
        });
        imageObjects = await Promise.all(uploadPromises);
      }

      // 4. Create document configuration records matching your schema fields
      const cleaningRequest = await CleaningRequest.create({
        userId,
        ngoId: ngo._id,
        location,
        description,
        wasteType: parsedWasteType,
        images: imageObjects, 
        companyId,
        status: status || "pending",
      });

      return res.status(201).json({
        success: true,
        message: "Cleaning request created successfully with binary images!",
        data: cleaningRequest,
      });
    } catch (error) {
      console.error("CREATE CLEANING REQUEST ERROR:", error);
      
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- GET OWN CLEANING REQUESTS ---- //
  async getOwnCleaningRequests(req, res) {
    try {
      console.log("req.user =>", req.user);

      const ngo = await NGO.findOne({
        userId: req.user.id,
      });

      console.log("ngo =>", ngo);

      if (!ngo) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const requests = await CleaningRequest.find({
        ngoId: ngo._id,
      });

      console.log("requests =>", requests);

      return res.status(200).json({
        success: true,
        total: requests.length,
        data: requests,
      });
    } catch (error) {
      console.error("ERROR =>", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ----- CREATE REVIEW ---- //
  async createReview(req, res) {
    try {
      const userId = req.user.id;

      const ngo = await NGO.findOne({ userId });

      const review = await Review.create({
        ngoId: ngo._id,
        ...req.body,
      });

      return res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ---- UPDATE REVIEW ---- //
  async updateReview(req, res) {
    try {
      const { id } = req.params;

      const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      return res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: updatedReview,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -----  DELETE REVIEW ----- //
  async deleteReview(req, res) {
    try {
      const { id } = req.params;

      await Review.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


  // ----- VIEW CERTIFICATES ----- //
  async viewCertificates(req, res) {
    try {
      const userId = req.user.id;

      const ngo = await NGO.findOne({ userId });

      // ✅ GUARD CLAUSE: Return clean fallback if user has no NGO yet
      if (!ngo) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const certificates = await Certificate.find({
        _id: { $in: ngo.certificates || [] },
      });

      return res.status(200).json({
        success: true,
        data: certificates,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ----- VIEW BADGES ----- //
  async viewBadges(req, res) {
    try {
      const userId = req.user.id;

      const ngo = await NGO.findOne({ userId });

      // ✅ GUARD CLAUSE: Return clean fallback if user has no NGO yet
      if (!ngo) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const badges = await Badge.find({
        _id: { $in: ngo.badges || [] },
      });

      return res.status(200).json({
        success: true,
        data: badges,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // ----- HIRE CLEANING COMPANY ----- //
  async hireCleaningCompany(req, res) {
    try {
      const { companyId, requestId } = req.body;

      const company = await CleaningCompany.findById(companyId);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Cleaning company not found",
        });
      }

      const request = await CleaningRequest.findByIdAndUpdate(
        requestId,
        {
          companyId,
          status: "assigned",
        },
        {
          new: true,
        },
      );

      return res.status(200).json({
        success: true,
        message: "Cleaning company hired successfully",
        data: request,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ----- VIEW ALL CAMPAIGNS FOR ADMIN ----- //
  async viewCampaignsForAdmin(req, res) {
    try {
      const campaigns = await Campaign.find()
        .populate({
          path: "ngoId",
          select:
            "ngoName city state ngoType isApproved badges coverImage createdAt",
          populate: {
            path: "userId",
            select: "name email profileImage role",
          },
        })
        .populate({
          path: "cleaningRequestId",
          select: "location wasteType status",
        })
        .populate({
          path: "reviews",
          select: "rating comment",
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        totalCampaigns: campaigns.length,
        data: campaigns,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new NGOController();
