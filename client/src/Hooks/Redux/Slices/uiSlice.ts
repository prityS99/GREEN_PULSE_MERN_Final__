import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  successMessage: string | null;
  errorMessage: string | null;
}

const initialState: UiState = {
  successMessage: null,
  errorMessage: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // ✅ The action you are importing to clear the toast buffer
    clearNotification: (state) => {
      state.successMessage = null;
      state.errorMessage = null;
    },
    // Manual setter if you ever want to trigger a toast from a regular component
    setNotification: (
      state, 
      action: PayloadAction<{ success?: string; error?: string }>
    ) => {
      if (action.payload.success) state.successMessage = action.payload.success;
      if (action.payload.error) state.errorMessage = action.payload.error;
    },
  },
  // ExtraReducers catch your backend controller messages dynamically!
  extraReducers: (builder) => {
    builder
      // Intercept any fulfilled action across your app that passes a standard JSON response
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state, action: any) => {
          if (action.payload?.success && action.payload?.message) {
            state.successMessage = action.payload.message; // E.g., "NGO updated successfully"
          }
        }
      )
      // Intercept any rejected API call
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => {
          const errMsg = action.payload?.message || action.error?.message;
          if (errMsg) {
            state.errorMessage = errMsg;
          }
        }
      );
  },
});

export const { clearNotification, setNotification } = uiSlice.actions;
export default uiSlice.reducer;