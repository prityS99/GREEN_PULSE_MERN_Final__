const Campaign = require("../models/campaigns");
const Ngo = require("../models/ngo");
const Badge = require("../models/badge");

class BadgeController {
  // ---------------- CREATE BADGE ---------------- //

  async createBadge(req, res) {
    try {
      const { badgeName, badgeImage, description, badgeColor } = req.body;

      // validation
      if (!badgeName) {
        return res.status(400).json({
          success: false,
          message: "Badge name is required",
        });
      }

      // === REPLACE YOUR OLD ALLOWED BADGES CHECK WITH THIS ===
      const allowedBadges = ["Good", "Excellent", "Elite"];

      if (!allowedBadges.includes(badgeName)) {
        return res.status(400).json({
          success: false,
          message: "Badge must be Good, Excellent, or Elite",
        });
      }
      // =======================================================

      // existing badge check
      const existingBadge = await Badge.findOne({
        badgeName: badgeName, // Removed .toLowerCase()
      });

      if (existingBadge) {
        return res.status(409).json({
          success: false,
          message: "Badge already exists",
        });
      }

      // create badge
      const badge = await Badge.create({
        badgeName: badgeName, // Removed .toLowerCase()
        badgeImage: badgeImage || "",
        description: description || "",
        badgeColor: badgeColor || "#000000",
      });

      return res.status(201).json({
        success: true,
        message: "Badge created successfully",
        data: badge,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create badge",
        error: error.message,
      });
    }
  }

  // ---------------- UPDATE BADGE ---------------- //
  async updateBadge(req, res) {
    try {
      const { badgeId } = req.params;
      const badge = await Badge.findById(badgeId);

      if (!badge) {
        return res.status(404).json({
          success: false,
          message: "Badge not found",
        });
      }

      const { badgeImage, description, requiredPoints, badgeColor, isActive } =
        req.body;

      if (badgeImage) badge.badgeImage = badgeImage;
      if (description) badge.description = description;
      if (requiredPoints !== undefined) badge.requiredPoints = requiredPoints;
      if (badgeColor) badge.badgeColor = badgeColor;
      if (isActive !== undefined) badge.isActive = isActive;

      await badge.save();

      return res.status(200).json({
        success: true,
        message: "Badge updated successfully",
        data: badge,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update badge",
        error: error.message,
      });
    }
  }

  // ---------------- DELETE BADGE ---------------- //
  async deleteBadge(req, res) {
    try {
      const { badgeId } = req.params;
      const badge = await Badge.findById(badgeId);

      if (!badge) {
        return res.status(404).json({
          success: false,
          message: "Badge not found",
        });
      }

      await badge.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Badge deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete badge",
        error: error.message,
      });
    }
  }

// ---------------- UPDATE NGO BADGE ---------------- //
  async updateNgoBadge(req, res) {
    try {
      const { ngoId } = req.params;
      const { badgeName } = req.body; // Comes in as "Good", "Excellent", or "Elite"

      // 1. Validation
      if (!badgeName) {
        return res.status(400).json({
          success: false,
          message: "Badge name is required",
        });
      }

      // 2. Strict validation matching your EXACT Mongoose enum casing
      const allowedBadges = ["Good", "Excellent", "Elite"];
      if (!allowedBadges.includes(badgeName.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid badge name. Must be Good, Excellent, or Elite",
        });
      }

      // 3. Find or Create using the EXACT casing
      let badge = await Badge.findOne({ 
        badgeName: badgeName.trim() // NO MORE .toLowerCase() here!
      });

      if (!badge) {
        badge = await Badge.create({
          badgeName: badgeName.trim(),
          requiredPoints: 0,
        });
      }

      // 4. Find the NGO and update its badges array
      const ngo = await Ngo.findById(ngoId);
      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: "NGO not found",
        });
      }

      // Replace old badge with the new one
      ngo.badges = [badge._id];
      await ngo.save(); 
      const updatedNgo = await Ngo.findById(ngoId).populate("badges");

      return res.status(200).json({
        success: true,
        message: "NGO badge updated successfully",
        data: updatedNgo,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update NGO badge",
        error: error.message,
      });
    }
  }


  // ---------------- GET SINGLE BADGE ---------------- //
  async getSingleBadge(req, res) {
    try {
      const { badgeId } = req.params;
      const badge = await Badge.findById(badgeId);

      if (!badge) {
        return res.status(404).json({
          success: false,
          message: "Badge not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: badge,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch badge",
        error: error.message,
      });
    }
  }

  // ---------------- GET ALL BADGES ---------------- //
  async getAllBadges(req, res) {
    try {
      const badges = await Badge.find().sort({ requiredPoints: 1 });

      return res.status(200).json({
        success: true,
        totalBadges: badges.length,
        data: badges,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch badges",
        error: error.message,
      });
    }
  }

  // ---------------- SEARCH BADGES ---------------- //
  async searchBadges(req, res) {
    try {
      const { keyword = "" } = req.query;

      const badges = await Badge.find({
        badgeName: {
          $regex: keyword,
          $options: "i",
        },
      });

      return res.status(200).json({
        success: true,
        count: badges.length,
        data: badges,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to search badges",
        error: error.message,
      });
    }
  }

  // ---------------- GET ELITE BADGES ---------------- //
  async getEliteBadges(req, res) {
    try {
      const badges = await Badge.find({
        badgeName: "elite",
        isActive: true,
      });

      return res.status(200).json({
        success: true,
        data: badges,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch elite badges",
        error: error.message,
      });
    }
  }

  // ---------------- NGO BADGE ANALYTICS ---------------- //
  // ---------------- NGO BADGE ANALYTICS ---------------- //
  async getNgoBadgeAnalytics(req, res) {
    try {
      const analytics = await Campaign.aggregate([
        {
          $group: {
            _id: "$ngoId",
            totalCampaigns: { $sum: 1 },
          },
        },
        // === REPLACE YOUR OLD $addFields STAGE WITH THIS ===
        {
          $addFields: {
            earnedBadge: {
              $switch: {
                branches: [
                  {
                    case: { $gte: ["$totalCampaigns", 8] },
                    then: "Elite", // Capitalized
                  },
                  {
                    case: { $gte: ["$totalCampaigns", 4] },
                    then: "Good", // Capitalized
                  },
                ],
                default: "Excellent", // Capitalized fallback replaces "moderate"
              },
            },
          },
        },
        // ===================================================
        {
          $lookup: {
            from: "ngos",
            localField: "_id",
            foreignField: "_id",
            as: "ngoDetails",
          },
        },
        { $unwind: "$ngoDetails" },
        {
          $project: {
            _id: 0,
            ngoId: "$ngoDetails._id",
            ngoName: "$ngoDetails.ngoName",
            city: "$ngoDetails.city",
            country: "$ngoDetails.country",
            totalCampaigns: 1,
            earnedBadge: 1,
          },
        },
        { $sort: { totalCampaigns: -1 } },
      ]);

      // SAFE UPDATE LOOP
      for (const item of analytics) {
        const badgeDoc = await Badge.findOne({
          badgeName: item.earnedBadge,
        });

        if (!badgeDoc) continue;

        await Ngo.findByIdAndUpdate(
          item.ngoId,
          {
            $addToSet: {
              badges: badgeDoc._id,
            },
          },
          {
            new: true,
            upsert: false,
          },
        );
      }

      return res.status(200).json({
        success: true,
        totalNGOs: analytics.length,
        data: analytics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch NGO badge analytics",
        error: error.message,
      });
    }
  }
}

module.exports = new BadgeController();
