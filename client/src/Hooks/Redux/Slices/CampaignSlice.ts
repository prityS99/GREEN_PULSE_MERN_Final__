import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// --- Types & Interfaces ---
export type CampaignStatus = "pending" | "upcoming" | "active" | "completed";
export type VolunteerRequestStatus = "pending" | "approved" | "rejected";

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  ngoId: string;
  location: string;
  date: string;
  status: CampaignStatus;
  createdBy: string;
  ngoName?: string;
  ngoLogo?: string;
  totalVolunteers?: number;
  volunteers?: string[];
}

export interface VolunteerRequest {
  _id: string;
  campaignId: string;
  userId: string;
  ngoId: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  status: VolunteerRequestStatus;
  campaignTitle?: string;
  applicantName?: string;
  applicantEmail?: string;
  ngoName?: string;
  createdAt: string;
}

interface CampaignState {
  campaigns: Campaign[];
  volunteerRequests: VolunteerRequest[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CampaignState = {
  campaigns: [],
  volunteerRequests: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Base API route configuration matching your express system
const API_URL = "/api/campaigns";

// Secure authorization header extractor
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// --- Async Thunks ---

// 1. Create Campaign (NGO submitting for verification)
export const createCampaign = createAsyncThunk(
  "campaigns/create",
  async (
    campaignData: { title: string; description: string; ngoId: string; location: string; date: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/create`, campaignData, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit campaign for approval");
    }
  }
);

// 2. Approve Campaign (Admin authorization route)
export const approveCampaign = createAsyncThunk(
  "campaigns/approve",
  async (campaignId: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/approve/${campaignId}`, {}, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve campaign");
    }
  }
);

// 3. Get All Campaigns (Global Dashboard Feed)
export const getAllCampaigns = createAsyncThunk(
  "campaigns/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/all`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch active campaigns");
    }
  }
);

// 4. Join / Apply For Campaign (User entry point)
export const applyForCampaign = createAsyncThunk(
  "campaigns/apply",
  async (
    { campaignId, applicationData }: { campaignId: string; applicationData: { name: string; age: number; phone: string; address: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/apply/${campaignId}`, applicationData, getAuthConfig());
      return { campaignId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Application to join campaign failed");
    }
  }
);

// 5. Get All Volunteer Requests (Admin global monitoring panel)
export const getAllVolunteerRequests = createAsyncThunk(
  "campaigns/getAllVolunteerRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/volunteer-requests/all`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load global volunteer roster");
    }
  }
);

// 6. Get NGO Volunteer Requests (Isolated dashboard contextual feed)
export const getNgoVolunteerRequests = createAsyncThunk(
  "campaigns/getNgoVolunteerRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/volunteer-requests/ngo`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your NGO application roster");
    }
  }
);

// --- Slice Definition ---
const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    clearCampaignStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Allows instant real-time synchronization via custom WebSocket contexts
    appendRealtimeLiveCampaign: (state, action: PayloadAction<Campaign>) => {
      const existingIndex = state.campaigns.findIndex((c) => c._id === action.payload._id);
      if (existingIndex === -1) {
        state.campaigns.unshift(action.payload);
      }
    },
  },
extraReducers: (builder) => {
    builder
      // 1. Specific Case Pipelines MUST come first
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(approveCampaign.fulfilled, (state, action) => {
        state.loading = false;
        const approvedCampaign = action.payload.data;
        const index = state.campaigns.findIndex((c) => c._id === approvedCampaign._id);
        if (index !== -1) {
          state.campaigns[index] = approvedCampaign;
        } else {
          state.campaigns.unshift(approvedCampaign);
        }
        state.successMessage = action.payload.message;
      })
      .addCase(getAllCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.data;
      })
      .addCase(applyForCampaign.fulfilled, (state, action) => {
        state.loading = false;
        const { campaignId, campaignVolunteersCount, volunteerData } = action.payload;
        
        const index = state.campaigns.findIndex((c) => c._id === campaignId);
        if (index !== -1) {
          state.campaigns[index].totalVolunteers = campaignVolunteersCount;
        }
        state.volunteerRequests.unshift(volunteerData);
        state.successMessage = action.payload.message;
      })
      .addCase(getAllVolunteerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteerRequests = action.payload.data;
      })
      .addCase(getNgoVolunteerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteerRequests = action.payload.data;
      })

      // 2. Universal Matchers MUST come last
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

export const { clearCampaignStatus, appendRealtimeLiveCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;