const Certificate = require("../models/certificate");
const Campaign = require("../models/campaigns");
const User = require("../models/users");
const GovtOfficer = require("../models/govtOfficer");
const mongoose = require("mongoose");

class CertificateController {

async issueCertificate(req, res) {
  try {
    const {
      ngoId,
      userId,
      issuedBy,
      certificateNumber,
      certificateFile,
    } = req.body;

    // -------- CHECK USER -------- //
    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------- CHECK NGO -------- //
    const ngoExists = await NGO.findById(ngoId);

    if (!ngoExists) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    // -------- ONLY ELITE NGO -------- //
    if (
      ngoExists.badge?.toLowerCase() !==
      "elite"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only Elite badge NGOs can receive government certificates",
      });
    }

    // -------- CHECK OFFICER -------- //
    const officerExists =
      await GovtOfficer.findById(issuedBy);

    if (!officerExists) {
      return res.status(404).json({
        success: false,
        message:
          "Government officer not found",
      });
    }

    // -------- DUPLICATE CERTIFICATE -------- //
    const existingCertificate =
      await Certificate.findOne({
        certificateNumber,
      });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message:
          "Certificate number already exists",
      });
    }

    // -------- CREATE CERTIFICATE -------- //
    const certificate =
      await Certificate.create({
        ngoId,
        userId,
        issuedBy,
        certificateNumber,
        certificateFile,
        approvalStatus: "pending",
      });

    return res.status(201).json({
      success: true,
      message:
        "Certificate request submitted successfully",
      data: certificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to issue certificate",
      error: error.message,
    });
  }
}
  // ---------------- GET SINGLE CERTIFICATE ---------------- //
  async getSingleCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(certificateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid certificate ID",
        });
      }

      const certificate = await Certificate.findById(certificateId)
        .populate("userId", "name email")
        .populate("issuedBy", "name designation");

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: certificate,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch certificate",
        error: error.message,
      });
    }
  }

  // ---------------- GET ALL CERTIFICATES ---------------- //
  async getAllCertificates(req, res) {
    try {
      const certificates = await Certificate.find()
        .populate("userId", "name email")
        .populate("issuedBy", "name designation")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: certificates.length,
        data: certificates,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch certificates",
        error: error.message,
      });
    }
  }

  // ---------------- GET USER CERTIFICATES ---------------- //
  async getUserCertificates(req, res) {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const certificates = await Certificate.find({ userId })
        .populate("campaignId", "title")
        .populate("issuedBy", "name designation")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: certificates.length,
        data: certificates,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user certificates",
        error: error.message,
      });
    }
  }

  // ---------------- UPDATE CERTIFICATE ---------------- //
  async updateCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const updatedCertificate = await Certificate.findByIdAndUpdate(
        certificateId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedCertificate) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Certificate updated successfully",
        data: updatedCertificate,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update certificate",
        error: error.message,
      });
    }
  }

  // ---------------- DELETE CERTIFICATE ---------------- //
  async deleteCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const deletedCertificate = await Certificate.findByIdAndDelete(
        certificateId
      );

      if (!deletedCertificate) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Certificate deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete certificate",
        error: error.message,
      });
    }
  }

  // ---------------- CERTIFICATE ANALYTICS ---------------- //
  async certificateAnalytics(req, res) {
    try {
      const analytics = await Certificate.aggregate([
        {
          $group: {
            _id: "$userId",
            totalCertificates: { $sum: 1 },
          },
        },
        {
          $sort: {
            totalCertificates: -1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch analytics",
        error: error.message,
      });
    }
  }

  // ---------------- ADMIN APPROVES CERTIFICATE ---------------- //
  async approveCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate =
        await Certificate.findById(
          certificateId
        ).populate("ngoId");

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      // -------- ALREADY APPROVED -------- //
      if (
        certificate.approvalStatus ===
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Certificate already approved",
        });
      }

      // -------- UPDATE STATUS -------- //
      certificate.approvalStatus =
        "approved";

      await certificate.save();

      // -------- GLOBAL DASHBOARD ANNOUNCEMENT -------- //
      await Announcement.create({
        title: "Government Certification",

        description: `${certificate.ngoId.ngoName} is going to be government certified for their excellent social and environmental work.`,

        createdBy: req.user.id,

        type: "certificate",
      });

      return res.status(200).json({
        success: true,
        message:
          "Certificate approved successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to approve certificate",
        error: error.message,
      });
    }
  }

  // ---------------- REJECT CERTIFICATE ---------------- //
  async rejectCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate =
        await Certificate.findById(
          certificateId
        );

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      certificate.approvalStatus =
        "rejected";

      await certificate.save();

      return res.status(200).json({
        success: true,
        message:
          "Certificate rejected successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to reject certificate",
        error: error.message,
      });
    }
  }

  // ---------------- GLOBAL DASHBOARD CERTIFICATES ---------------- //
  async getApprovedCertificates(req, res) {
    try {
      const certificates =
        await Certificate.aggregate([
          {
            $match: {
              approvalStatus: "approved",
            },
          },

          {
            $lookup: {
              from: "ngos",
              localField: "ngoId",
              foreignField: "_id",
              as: "ngoDetails",
            },
          },

          {
            $unwind: "$ngoDetails",
          },

          {
            $lookup: {
              from: "govtofficers",
              localField: "issuedBy",
              foreignField: "_id",
              as: "officerDetails",
            },
          },

          {
            $unwind: {
              path: "$officerDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              certificateNumber: 1,
              certificateFile: 1,
              issueDate: 1,

              ngoName:
                "$ngoDetails.ngoName",

              ngoLogo:
                "$ngoDetails.profilePicture",

              officerName:
                "$officerDetails.name",

              message: {
                $concat: [
                  "$ngoDetails.ngoName",
                  " is going to be government certified for their excellent work.",
                ],
              },
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },
        ]);

      return res.status(200).json({
        success: true,
        total: certificates.length,
        data: certificates,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch certificates",
        error: error.message,
      });
    }
  }
}


module.exports = new CertificateController();