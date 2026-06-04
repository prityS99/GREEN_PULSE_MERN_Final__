import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// --- Types & Interfaces ---
export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface AIState {
  chatHistory: ChatMessage[];
  generatedSummary: string | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AIState = {
  chatHistory: [],
  generatedSummary: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Base URL configuration for your Express router setup
const API_URL = "/api/ai";

// Token extraction helper for authorized requests
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// --- Async Thunks ---

// 1. Summarize NGO Description
export const summarizeNGODescription = createAsyncThunk(
  "ai/summarizeNGO",
  async (description: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/summarize-ngo`,
        { description },
        getAuthConfig()
      );
      // Expected backend response: { success: true, message: "...", summary: "..." }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate AI summary"
      );
    }
  }
);

// --- Slice Definition ---
const aiChatboxSlice = createSlice({
  name: "aiChatbox",
  initialState,
  reducers: {
    clearAIStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSummary: (state) => {
      state.generatedSummary = null;
    },
    // Optional utility: Manual localized insertion of conversation steps into chatbox streams
    addChatMessage: (state, action: PayloadAction<Omit<ChatMessage, "id" | "timestamp">>) => {
      state.chatHistory.push({
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      });
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Pending Lifecycle
      .addCase(summarizeNGODescription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      // Handle Rejected Lifecycle
      .addCase(summarizeNGODescription.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle Fulfilled Success State
      .addCase(summarizeNGODescription.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedSummary = action.payload.summary;
        state.successMessage = action.payload.message;

        // Optional: Dynamically push the AI response straight into the chat message bubble array logs
        state.chatHistory.push({
          id: crypto.randomUUID(),
          sender: "ai",
          text: action.payload.summary,
          timestamp: new Date().toISOString(),
        });
      });
  },
});

export const { clearAIStatus, clearSummary, addChatMessage, clearChatHistory } = aiChatboxSlice.actions;
export default aiChatboxSlice.reducer;