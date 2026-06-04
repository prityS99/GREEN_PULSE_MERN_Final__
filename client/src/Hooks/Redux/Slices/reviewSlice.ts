import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// --- Types & Interfaces ---
export interface ReviewUser {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string;
}

export interface Review {
  _id: string;
  userId: string | ReviewUser;
  companyId?: string | { _id: string; companyName: string };
  ngoId?: string | { _id: string; ngoName: string };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewState {
  reviews: Review[];
  currentReview: Review | null;
  averageRating: number;
  totalReviews: number;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  currentReview: null,
  averageRating: 0,
  totalReviews: 0,
  loading: false,
  error: null,
  successMessage: null,
};

// Base URL targeting your Express backend router configuration
const API_URL = "/api/reviews";

// Helper for authorized headers extraction
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// --- Async Thunks ---

// 1. Create Review (Targets either companyId OR ngoId natively)
export const createReview = createAsyncThunk(
  "reviews/create",
  async (
    payload: { companyId?: string; ngoId?: string; rating: number; comment: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/create`, payload, getAuthConfig());
      return response.data; // Expected: { success: true, message: "...", data: review }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit review");
    }
  }
);

// 2. Update Review (Allowed for Owners and Admins)
export const updateReview = createAsyncThunk(
  "reviews/update",
  async (
    { reviewId, rating, comment }: { reviewId: string; rating?: number; comment?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`${API_URL}/update/${reviewId}`, { rating, comment }, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to alter review payload");
    }
  }
);

// 3. Delete Review
export const deleteReview = createAsyncThunk(
  "reviews/delete",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/delete/${reviewId}`, getAuthConfig());
      return { reviewId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove review history record");
    }
  }
);

// 4. Get Single Review by ID
export const getSingleReview = createAsyncThunk(
  "reviews/getSingle",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/single/${reviewId}`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Review log target unavailable");
    }
  }
);

// 5. Get Company Reviews (Returns array logs alongside aggregated score metrics)
export const getCompanyReviews = createAsyncThunk(
  "reviews/getCompanyReviews",
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/company/${companyId}`, getAuthConfig());
      return response.data; // Expected: { success: true, totalReviews: x, averageRating: y, data: [...] }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to populate corporate feedback files");
    }
  }
);

// 6. Get NGO Reviews (Returns array logs alongside aggregated score metrics)
export const getNgoReviews = createAsyncThunk(
  "reviews/getNgoReviews",
  async (ngoId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/ngo/${ngoId}`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to capture NGO validation ratings");
    }
  }
);

// 7. Get Own Reviews (Context list filtered by active user verification keys)
export const getOwnReviews = createAsyncThunk(
  "reviews/getOwnReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/own`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to trace your account submission log");
    }
  }
);

// --- Slice Definition ---
const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetCurrentReview: (state) => {
      state.currentReview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Explicit `.addCase` configurations MUST be declared first to appease TS type checks
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload.data);
        state.successMessage = action.payload.message;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload.data;
        const index = state.reviews.findIndex((r) => r._id === updatedReview._id);
        if (index !== -1) {
          state.reviews[index] = updatedReview;
        }
        if (state.currentReview?._id === updatedReview._id) {
          state.currentReview = updatedReview;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter((r) => r._id !== action.payload.reviewId);
        if (state.currentReview?._id === action.payload.reviewId) {
          state.currentReview = null;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(getSingleReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload.data;
      })
      .addCase(getCompanyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.totalReviews = action.payload.totalReviews;
        state.averageRating = action.payload.averageRating;
      })
      .addCase(getNgoReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.totalReviews = action.payload.totalReviews;
        state.averageRating = action.payload.averageRating;
      })
      .addCase(getOwnReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
      })

      // 2. Trailing catch-all Action Matchers append clean at the absolute bottom of the loop
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearReviewStatus, resetCurrentReview } = reviewSlice.actions;
export default reviewSlice.reducer;