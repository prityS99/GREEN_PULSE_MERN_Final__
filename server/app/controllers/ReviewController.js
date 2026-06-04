const Review = require("../models/review");
const CleaningCompany = require("../models/cleaningCompany");
const Ngo = require("../models/ngo");

class ReviewController {
  // ------- CREATE REVIEW ------- //

  async createReview(req, res) {
    try {
      const { companyId, ngoId, rating, comment } = req.body;

     // only one target allowed
      if (!companyId && !ngoId) {
        return res.status(400).json({
          success: false,
          message: "Company ID or NGO ID is required",
        });
      }

      if (companyId && ngoId) {
        return res.status(400).json({
          success: false,
          message: "Review can only belong to one target",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 to 5",
        });
      }

   
      if (companyId) {
        const company = await CleaningCompany.findById(companyId);

        if (!company) {
          return res.status(404).json({
            success: false,
            message: "Cleaning company not found",
          });
        }
      }

      // check ngo exists
      if (ngoId) {
        const ngo = await Ngo.findById(ngoId);

        if (!ngo) {
          return res.status(404).json({
            success: false,
            message: "NGO not found",
          });
        }
      }

    
      const existingReview = await Review.findOne({
        userId: req.user.id,
        ...(companyId ? { companyId } : { ngoId }),
      });

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: "You already reviewed this entity",
        });
      }

      const review = await Review.create({
        userId: req.user.id,
        companyId,
        ngoId,
        rating,
        comment,
      });

      return res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create review",
        error: error.message,
      });
    }
  }

  // ----- UPDATE REVIEW ------ //

  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // -- ADMIN ONLY -- //
      const isOwner = review.userId.toString() === req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this review",
        });
      }

      if (rating) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: "Rating must be between 1 to 5",
          });
        }

        review.rating = rating;
      }

      if (comment) {
        review.comment = comment;
      }

      await review.save();

      return res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update review",
        error: error.message,
      });
    }
  }

  // -------- DELETE REVIEW --------- //
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // ---- ADMIN ---- //
      const isOwner = review.userId.toString() === req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this review",
        });
      }

      await review.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete review",
        error: error.message,
      });
    }
  }

  // --------- GET SINGLE REVIEW ------ //
  async getSingleReview(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId)
        .populate("userId", "name email profilePicture")
        .populate("companyId", "companyName")
        .populate("ngoId", "ngoName");

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch review",
        error: error.message,
      });
    }
  }

  // -------- GET COMPANY REVIEWS ------- //
  async getCompanyReviews(req, res) {
    try {
      const { companyId } = req.params;

      const reviews = await Review.find({ companyId })
        .populate("userId", "name profilePicture")
        .sort({ createdAt: -1 });

      // aggregation for average rating
      const ratingData = await Review.aggregate([
        {
          $match: {
            companyId: companyId
              ? new require("mongoose").Types.ObjectId(companyId)
              : null,
          },
        },
        {
          $group: {
            _id: "$companyId",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        totalReviews: ratingData[0]?.totalReviews || 0,
        averageRating: ratingData[0]?.averageRating || 0,
        data: reviews,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch company reviews",
        error: error.message,
      });
    }
  }

  // ----- GET NGO REVIEWS ----- //
  async getNgoReviews(req, res) {
    try {
      const { ngoId } = req.params;

      const reviews = await Review.find({ ngoId })
        .populate("userId", "name profilePicture")
        .sort({ createdAt: -1 });

      const ratingData = await Review.aggregate([
        {
          $match: {
            ngoId: ngoId
              ? new require("mongoose").Types.ObjectId(ngoId)
              : null,
          },
        },
        {
          $group: {
            _id: "$ngoId",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        totalReviews: ratingData[0]?.totalReviews || 0,
        averageRating: ratingData[0]?.averageRating || 0,
        data: reviews,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch NGO reviews",
        error: error.message,
      });
    }
  }

  // ----- GET OWN REVIEWS ------ //
  async getOwnReviews(req, res) {
    try {
      const reviews = await Review.find({
        userId: req.user.id,
      })
        .populate("companyId", "companyName")
        .populate("ngoId", "ngoName")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch your reviews",
        error: error.message,
      });
    }
  }
}

module.exports = new ReviewController();