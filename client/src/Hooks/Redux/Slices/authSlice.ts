import api from "@/lib/axios"; 
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:4002";

axios.defaults.withCredentials = true;

interface User {
  _id: string;        
  id?: string;       
  name: string;
  email: string;
  role: string 
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const token = getInitialToken();

const initialState: AuthState = {
  user: null,
  accessToken: token,
  isAuthenticated: false, // Default false until profile payload verifies it
  loading: false,
  error: null,
  successMessage: null,
};

// ================= SIGNUP ================= //
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData: { name: string; email: string; password: string; role: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${API}/signup`, userData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Signup Failed");
    }
  }
);

// ================= VERIFY EMAIL ================= //
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, thunkAPI) => {
    try {
      const response = await axios.get(`${API}/verify-email/${token}`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Verification Failed");
    }
  }
);

// ================= LOGIN ================= //
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${API}/login`, userData);
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Login Failed");
    }
  }
);

// ================= REFRESH TOKEN ================= //
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API}/refresh-token`);
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      return response.data;
    } catch (error: any) {
      localStorage.removeItem("accessToken");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Session Expired");
    }
  }
);

// ================= FORGOT PASSWORD ================= //
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, thunkAPI) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Forgot Password Failed");
    }
  }
);

// ================= RESET PASSWORD ================= //
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { token: string; password: string }, thunkAPI) => {
    try {
      const response = await api.post(`/auth/reset-password/${data.token}`, {
        password: data.password,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Reset Password Failed");
    }
  }
);

// ================= PROFILE ================= //
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      localStorage.removeItem("accessToken"); 
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Profile Fetch Failed");
    }
  }
);


// ================= UPDATE PROFILE (NEW) ================= //
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData: FormData, thunkAPI) => {
    try {
      // Handles profile text attributes, passwords, and multipart images via one merged endpoint
      const response = await axios.put(`${API}/update-profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update profile settings");
    }
  }
);

// ================= LOGOUT ================= //
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API}/logout`);
      localStorage.removeItem("accessToken");
      return response.data;
    } catch (error: any) {
      localStorage.removeItem("accessToken");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Logout Failed");
    }
  }
);

// ================= SLICE ================= //
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Programmatic reset utility for safe component-level signouts
    resetAuthState: () => initialState, 
  },
  extraReducers: (builder) => {
    // ---------- SIGNUP ---------- //
    builder.addCase(signupUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(signupUser.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
    });
    builder.addCase(signupUser.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ---------- VERIFY EMAIL ---------- //
    builder.addCase(verifyEmail.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(verifyEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
    });
    builder.addCase(verifyEmail.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ---------- LOGIN ---------- //
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.successMessage = action.payload.message;
    });
    builder.addCase(loginUser.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.isAuthenticated = false;
    });

    // ---------- REFRESH TOKEN ---------- //
    builder.addCase(refreshAccessToken.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    });
    builder.addCase(refreshAccessToken.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
    });

    // ---------- PROFILE ---------- //
    builder.addCase(fetchProfile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchProfile.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
    });

    // ---------- UPDATE PROFILE CASES (NEW) ---------- //
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user; // Synchronizes the modified database record directly into application state
      state.successMessage = action.payload.message || "Profile configurations saved successfully.";
    });
    builder.addCase(updateProfile.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // ---------- LOGOUT ---------- //
    builder.addCase(logoutUser.fulfilled, (state) => {
      return initialState; // Clears slice data back to defaults cleanly
    });
    builder.addCase(logoutUser.rejected, (state) => {
      return initialState; // Force state clear even on request failure
    });
  },
});

export const { clearErrors, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
