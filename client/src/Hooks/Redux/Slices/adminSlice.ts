import api from "@/lib/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// --- Types & Interfaces ---
export type UserRole =
  | "admin"
  | "ngo"
  | "cleaning_company"
  | "govt_officer"
  | "user";
export type RequestStatus =
  | "pending"
  | "approved"
  | "accepted"
  | "rejected"
  | "completed";
export type RewardStatus = "pending" | "approved" | "rejected";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isDeleted: boolean;
  profilePicture?: string;
  createdAt: string;
}

interface CoverImage {
  url: string;
  publicId?: string;
}

export interface CleaningCompany {
  _id: string;
  userId: string;
  companyName: string;
  about: string;
  licenseNumber: string;
  workersCount: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  experienceYears: number;
  completedProjects: number;
  points: number;
  totalReviews: number;
  isApproved: boolean;
  coverImage?: CoverImage;
  ownerName?: string;
  ownerEmail?: string;
  ownerImage?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  targetAudience: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface Activity {
  _id: string;
  title: string;
  description: string;
  type: "cleaning" | "reward" | "announcement" | string;
  relatedId?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalAdmins: number;
  totalNgo: number;
  totalCleaningCompanies: number;
  totalGovtOfficers: number;
  verifiedUsers: number;
  totalApprovedCleaningRequests: number;
  totalApprovedRewards: number;
}
export interface CampaignItem {
  _id: string;
  title: string;
  description: string;
  location: string;
  date?: string;
  status: string;
  ngoName?: string;
  ngoLogo?: string;
  createdBy?: string;
  totalVolunteers?: number;
  isApprovedByAdmin?: boolean;
}

interface AdminState {
  users: User[];
  companies: CleaningCompany[];
  campaigns: CampaignItem[];
  selectedUser: User | null;
  announcements: Announcement[];
  activities: Activity[];
  analytics: AdminAnalytics | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AdminState = {
  users: [],
  companies: [],
  selectedUser: null,
  campaigns: [],
  announcements: [],
  activities: [],
  analytics: null,
  loading: false,
  error: null,
  successMessage: null,
};

const API_URL = "/admin";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// 1. View All Users
export const viewAllUsers = createAsyncThunk(
  "admin/viewAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/users`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// 2. View Single User
export const viewSingleUser = createAsyncThunk(
  "admin/viewSingleUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `${API_URL}/users/${userId}`,
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profiles",
      );
    }
  },
);

// 3. Update User Role
export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async (
    { userId, role }: { userId: string; role: UserRole },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(
        `${API_URL}/users/update-role/${userId}`,
        { role },
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change user role",
      );
    }
  },
);

// 4. Delete User (Logical Soft Delete)
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `${API_URL}/users/delete/${userId}`,
        getAuthConfig(),
      );
      return { userId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user profile",
      );
    }
  },
);

// 5. Restore User
export const restoreUser = createAsyncThunk(
  "admin/restoreUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${API_URL}/users/restore/${userId}`,
        {},
        getAuthConfig(),
      );
      return { userId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore user profile",
      );
    }
  },
);

// 6. Verify User Profile
export const verifyUser = createAsyncThunk(
  "admin/verifyUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${API_URL}/users/verify/${userId}`,
        {},
        getAuthConfig(),
      );
      return { userId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify user configuration",
      );
    }
  },
);

// 7. Approve Cleaning Request
export const approveCleaningRequest = createAsyncThunk(
  "admin/approveCleaningRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${API_URL}/cleaning-request/approve/${requestId}`,
        {},
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Approval of cleaning mission failed",
      );
    }
  },
);

// 8. Reject Cleaning Request
export const rejectCleaningRequest = createAsyncThunk(
  "admin/rejectCleaningRequest",
  async (
    { requestId, reason }: { requestId: string; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(
        `${API_URL}/cleaning-request/reject/${requestId}`,
        { reason },
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Rejection of cleaning mission failed",
      );
    }
  },
);

// 8b. View All NGO/Environmental Campaigns
export const viewAllCampaigns = createAsyncThunk(
  "admin/viewAllCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/campaigns`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard registry campaigns"
      );
    }
  }
);


export const approveCampaign = createAsyncThunk(
  "admin/approveCampaign",
  async (campaignId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${API_URL}/campaign/approve/${campaignId}`, 
        {}, 
        getAuthConfig()
      );
      return response.data; 
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Authorization approval action stream failed."
      );
    }
  }
);

// 9. Approve Reward Request
export const approveReward = createAsyncThunk(
  "admin/approveReward",
  async (rewardId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${API_URL}/reward/approve/${rewardId}`,
        {},
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Reward achievement confirmation failed",
      );
    }
  },
);

// 10. Reject Reward Request
export const rejectReward = createAsyncThunk(
  "admin/rejectReward",
  async (
    { rewardId, reason }: { rewardId: string; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(
        `${API_URL}/reward/reject/${rewardId}`,
        { reason },
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Reward request dismissal failed",
      );
    }
  },
);

// 11. Create Broadcast Announcement
export const createAnnouncement = createAsyncThunk(
  "admin/createAnnouncement",
  async (
    payload: { title: string; message: string; targetAudience: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(
        `${API_URL}/announcement/create`,
        payload,
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create management alert notice",
      );
    }
  },
);

// 12. View All Active Announcements
export const viewAllAnnouncements = createAsyncThunk(
  "admin/viewAllAnnouncements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `${API_URL}/announcements`,
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notices",
      );
    }
  },
);

// 13. View Public Global System Log Activities
export const viewGlobalActivities = createAsyncThunk(
  "admin/viewGlobalActivities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/activities`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to retrieve event logging history",
      );
    }
  },
);

// 14. Gather Admin Dashboard Numeric Analytics
export const fetchDashboardAnalytics = createAsyncThunk(
  "admin/fetchDashboardAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `${API_URL}/dashboard-analytics`,
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Analytical calculation failed",
      );
    }
  },
);

// 15. Fetch All Cleaning Companies
export const fetchAllCompanies = createAsyncThunk(
  "admin/fetchAllCompanies",
  async (_, { rejectWithValue }) => {
    try {
      // Fixed: Uses custom axios instance `api` instead of unimported global `axios`
      const response = await api.get(`${API_URL}/companies`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch companies list",
      );
    }
  },
);

// 16. Toggle/Approve Target Company Status

export const toggleCompanyApproval = createAsyncThunk(
  "admin/toggleCompanyApproval",
  async (
    { companyId, isApproved }: { companyId: string; isApproved: boolean },
    thunkAPI,
  ) => {
    try {
      // ✅ FIX: Added getAuthConfig() so the admin token passes permissions checks safely!
      const response = await api.put(
        `/admin/company/approve/${companyId}`,
        { isApproved },
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed execution",
      );
    }
  },
);
// --- Slice Definition ---
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    injectRealtimeGlobalActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload);
    },
    injectRealtimeAnnouncement: (
      state,
      action: PayloadAction<Announcement>,
    ) => {
      state.announcements.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(viewAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
      })
      .addCase(viewSingleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload.user;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        const index = state.users.findIndex((u) => u._id === updatedUser._id);
        if (index !== -1) state.users[index] = updatedUser;
        if (state.selectedUser?._id === updatedUser._id)
          state.selectedUser = updatedUser;
        state.successMessage = action.payload.message;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (u) => u._id !== action.payload.userId,
        );
        if (state.selectedUser?._id === action.payload.userId)
          state.selectedUser = null;
        state.successMessage = action.payload.message;
      })
      .addCase(restoreUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload.userId,
        );
        if (index !== -1) state.users[index].isVerified = true;
        if (
          state.selectedUser &&
          state.selectedUser._id === action.payload.userId
        ) {
          state.selectedUser.isVerified = true;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(approveCleaningRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(rejectCleaningRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
.addCase(viewAllCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: Extract from action.payload.data to match your API JSON payload
        const rawCampaigns = action.payload?.data || action.payload || [];
        state.campaigns = Array.isArray(rawCampaigns) ? rawCampaigns : [];
      })
      .addCase(approveCampaign.fulfilled, (state, action) => {
        state.loading = false;
        // Handles both payload structures safely (.campaign or fallback to root)
        const updatedCampaign = action.payload?.campaign || action.payload?.data;
        
        if (updatedCampaign) {
          const index = state.campaigns.findIndex((c) => c._id === updatedCampaign._id);
          if (index !== -1) {
            state.campaigns[index] = {
              ...updatedCampaign,
              isApprovedByAdmin: true // Ensure the local state sets this to true on click success
            };
          }
        }
        state.successMessage = action.payload?.message || "Campaign approved successfully!";
      })


.addCase(approveReward.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(rejectReward.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements.unshift(action.payload.announcement);
        state.successMessage = action.payload.message;
      })
      .addCase(viewAllAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload.announcements;
      })
      .addCase(viewGlobalActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.analytics;
      })
      .addCase(fetchAllCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = Array.isArray(action.payload)
          ? action.payload
          : action.payload.companies || [];
      })
      // Look inside your extraReducers block in adminSlice.ts
      .addCase(toggleCompanyApproval.fulfilled, (state, action) => {
        state.loading = false;

        const updatedCompany = action.payload?.company;

        if (updatedCompany) {
          // Find the company in the array using the company's internal _id
          const index = state.companies.findIndex(
            (c) => c._id === updatedCompany._id,
          );

          if (index !== -1) {
            // Replace the old company object with the fresh one from the backend
            state.companies[index] = updatedCompany;
          }
        }

        state.successMessage =
          action.payload.message || "Company authorization changed.";
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const {
  clearAdminStatus,
  injectRealtimeGlobalActivity,
  injectRealtimeAnnouncement,
} = adminSlice.actions;
export default adminSlice.reducer;
