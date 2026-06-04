import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// --- Types & Interfaces ---
export interface RequestImage {
  url: string;
}

export interface UserPopulated {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface CompanyPopulated {
  _id: string;
  companyName: string;
  phone?: string;
}

export interface CleaningRequest {
  _id: string;
  userId: UserPopulated;
  location: string;
  wasteType: string[];
  description?: string;
  images: RequestImage[];
  companyId: CompanyPopulated | string | null;
  ngoId?: UserPopulated | string | null;
  status: "pending" | "approved" | "accepted" | "rejected" | "completed" | "in_progress";
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  statusCounts: Array<{ _id: string; count: number }>;
  wasteDistribution: Array<{ _id: string | string[]; count: number }>;
  trends: Array<{ _id: string; totalRequests: number; completedRequests: number }>;
}

interface CleaningRequestState {
  requests: CleaningRequest[];
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CleaningRequestState = {
  requests: [],
  analytics: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Base URL configuration (Adjust to match your express api routing configuration)
const API_URL = "/api/cleaning-requests";

// Helper for authorized headers
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// --- Async Thunks ---

// 1. Create Request (Accepts FormData due to multiple image uploads)
export const createRequest = createAsyncThunk(
  "cleaningRequests/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/create`, formData, {
        headers: {
          ...getAuthConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create cleaning request");
    }
  }
);

// 2. Update Request Status (For Companies moving state tracking)
export const updateRequestStatus = createAsyncThunk(
  "cleaningRequests/updateStatus",
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/status/${id}`, { status }, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update request status");
    }
  }
);

// 3. Admin Approve Request
export const adminApproveRequest = createAsyncThunk(
  "cleaningRequests/adminApprove",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/admin/approve/${id}`, {}, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Admin approval failed");
    }
  }
);

// 4. Company Accept Approved Request
export const acceptRequest = createAsyncThunk(
  "cleaningRequests/companyAccept",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/accept/${id}`, {}, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept company task");
    }
  }
);

// 5. NGO Accept Completed Pickup Task
export const ngoAcceptPickup = createAsyncThunk(
  "cleaningRequests/ngoAccept",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/ngo/pickup/${id}`, {}, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to claim NGO pickup target");
    }
  }
);

// 6. Get Open Requests (List updates depend directly on Active User's logged Role context)
export const getOpenRequests = createAsyncThunk(
  "cleaningRequests/getOpen",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/open`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch available tasks");
    }
  }
);

// 7. Get Dashboard Analytics Facet Trends
export const getDashboardAnalytics = createAsyncThunk(
  "cleaningRequests/getAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/analytics`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch dashboard data");
    }
  }
);

// --- Slice Definition ---
const cleaningRequestSlice = createSlice({
  name: "cleaningRequests",
  initialState,
  reducers: {
    clearRequestStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Useful for incoming Real-time Websocket Listeners updates (Socket.io Event Injection handling)
    addOrUpdateRealtimeRequest: (state, action: PayloadAction<CleaningRequest>) => {
      const index = state.requests.findIndex((req) => req._id === action.payload._id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      } else {
        state.requests.unshift(action.payload);
      }
    },
    removeRealtimeRequest: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter((req) => req._id !== action.payload);
    },
  },
extraReducers: (builder) => {
    builder
      // 1. Specific Case Pipelines MUST come first
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload.data);
        state.successMessage = "Cleaning request submitted for verification successfully.";
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        const index = state.requests.findIndex((req) => req._id === updated._id);
        if (index !== -1) {
          state.requests[index] = updated;
        }
        state.successMessage = `Status successfully changed to ${updated.status}.`;
      })
      .addCase(adminApproveRequest.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        state.requests = state.requests.filter((req) => req._id !== updated._id);
        state.successMessage = action.payload.message;
      })
      .addCase(acceptRequest.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        const index = state.requests.findIndex((req) => req._id === updated._id);
        if (index !== -1) {
          state.requests[index] = updated;
        }
        state.successMessage = "Task assigned to your schedule successfully.";
      })
      .addCase(ngoAcceptPickup.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        const index = state.requests.findIndex((req) => req._id === updated._id);
        if (index !== -1) {
          state.requests[index] = updated;
        }
        state.successMessage = "Collection claimed successfully by your NGO.";
      })
      .addCase(getOpenRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
      })
      .addCase(getDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.data;
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

export const { clearRequestStatus, addOrUpdateRealtimeRequest, removeRealtimeRequest } = 
  cleaningRequestSlice.actions;

export default cleaningRequestSlice.reducer;