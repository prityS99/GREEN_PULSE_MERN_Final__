import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================================================
    TYPES
========================================================= */

export interface CoverImage {
  url: string;
  coverImageId: string;
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

export interface CleaningRequest {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  assignedCompany?: string;
  workProof?: string;
  createdAt: string;
}

interface CleaningCompanyState {
  companies: CleaningCompany[];
  currentCompany: CleaningCompany | null;
  assignedTasks: CleaningRequest[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

/* =========================================================
    INITIAL STATE
========================================================= */

const initialState: CleaningCompanyState = {
  companies: [],
  currentCompany: null,
  assignedTasks: [],
  loading: false,
  error: null,
  successMessage: null,
};

/* =========================================================
    API
========================================================= */

const API_URL = "/api/cleaning-company";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
  },
});

/* =========================================================
    THUNKS
========================================================= */

export const getSingleCompany = createAsyncThunk(
  "cleaningCompany/getSingle",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/single`, getAuthConfig());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch company");
    }
  }
);

export const getAllCompanies = createAsyncThunk(
  "cleaningCompany/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/all`, getAuthConfig());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch companies");
    }
  }
);

export const getAssignedTasks = createAsyncThunk(
  "cleaningCompany/getTasks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/tasks`, getAuthConfig());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

/* =========================================================
    SLICE
========================================================= */

const cleaningCompanySlice = createSlice({
  name: "cleaningCompany",
  initialState,
  reducers: {
    clearStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearCompany: (state) => {
      state.currentCompany = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===================== GET SINGLE ===================== */
      .addCase(getSingleCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCompany = action.payload?.data ?? null;
      })

      /* ===================== GET ALL ===================== */
      .addCase(getAllCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload?.data ?? [];
      })

      /* ===================== TASKS ===================== */
      .addCase(getAssignedTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedTasks = action.payload?.data ?? [];
      })

      /* ===================== GLOBAL PENDING ===================== */
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      /* ===================== GLOBAL ERROR ===================== */
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload || "Something went wrong";
        }
      );
  },
});

export const { clearStatus, clearCompany } = cleaningCompanySlice.actions;
export default cleaningCompanySlice.reducer;