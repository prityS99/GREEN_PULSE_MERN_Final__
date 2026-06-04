import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// --- Types & Interfaces ---
export interface NotificationCreator {
  _id: string;
  name: string;
  email: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isGlobal: boolean;
  isRead: boolean;
  receiverId?: any; // Dynamic or fully-populated recipient reference 
  receiverModel?: string;
  createdBy?: NotificationCreator;
  creatorModel?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  successMessage: null,
};

// Base URL targeting your Express API routes
const API_URL = "/api/notifications";

// Helper for extracting secure authorization configurations
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// --- Async Thunks ---

// 1. Get Contextual My Notifications (Global Feed + Personal Matches)
export const getMyNotifications = createAsyncThunk(
  "notifications/getMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/my`, getAuthConfig());
      return response.data; // Expected: { success: true, total: x, data: [...] }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load notifications");
    }
  }
);

// 2. Mark Notification as Read
export const markAsRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/read/${notificationId}`, {}, getAuthConfig());
      return response.data; // Expected: { success: true, data: updatedNotification }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to alter read status");
    }
  }
);

// 3. Delete Notification (Allowed for targets or System Admins)
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/delete/${notificationId}`, getAuthConfig());
      return { notificationId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to drop notification item");
    }
  }
);

// 4. Get All Notifications (Admin complete system lookup overview)
export const getAllNotifications = createAsyncThunk(
  "notifications/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/all`, getAuthConfig());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load management overview logs");
    }
  }
);

// --- Slice Definition ---
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Instant real-time state injection for Socket.io events (e.g., 'new_notification')
    receiveRealtimeNotification: (state, action: PayloadAction<AppNotification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Structural explicit '.addCase' builders are prioritized first to maintain clean type parsing
      .addCase(getMyNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.data.filter((n: AppNotification) => !n.isRead).length;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        const index = state.notifications.findIndex((n) => n._id === updated._id);
        if (index !== -1) {
          state.notifications[index] = updated;
        }
        // Recalculate local unread indicators down securely
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.successMessage = action.payload.message;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const target = state.notifications.find((n) => n._id === action.payload.notificationId);
        if (target && !target.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter((n) => n._id !== action.payload.notificationId);
        state.successMessage = action.payload.message;
      })
      .addCase(getAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
      })

      // 2. Catch-all utility lifecycle matchers reside safely at the bottom of the stack
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

export const { clearNotificationStatus, receiveRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;