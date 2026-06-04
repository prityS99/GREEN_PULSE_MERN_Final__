import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// ==========================================
// 1. TYPE DEFINITIONS
// ==========================================
export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    created_at: number;
  };
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  donation?: {
    _id: string;
    userId: string | null;
    amount: number;
    paymentFor: string;
    paymentMethod: string;
    transactionId: string;
    paymentStatus: string;
    createdAt: string;
  };
}

interface PaymentState {
  order: CreateOrderResponse["order"] | null;
  donationDetails: VerifyPaymentResponse["donation"] | null;
  loading: boolean;
  error: string | null;
  paymentStatus: "idle" | "loading" | "success" | "failed";
}

// ==========================================
// 2. INITIAL STATE
// ==========================================
const initialState: PaymentState = {
  order: null,
  donationDetails: null,
  loading: false,
  error: null,
  paymentStatus: "idle",
};

// ==========================================
// 3. ASYNC THUNKS (API Layer integration)
// ==========================================

// Thunk to initialize Razorpay Order
export const createDonationOrder = createAsyncThunk<
  CreateOrderResponse,
  number,
  { rejectValue: string }
>("payment/createDonationOrder", async (amount, { rejectWithValue }) => {
  try {
    const response = await api.post<CreateOrderResponse>("/payment/donate/order", { amount });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create donation order"
    );
  }
});

// Thunk to verify Razorpay Signature
export const verifyDonation = createAsyncThunk<
  VerifyPaymentResponse,
  VerifyPaymentPayload,
  { rejectValue: string }
>("payment/verifyDonation", async (verificationData, { rejectWithValue }) => {
  try {
    const response = await api.post<VerifyPaymentResponse>("/payment/donate/verify", verificationData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Payment verification failed"
    );
  }
});

// ==========================================
// 4. THE SLICE
// ==========================================
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    // Action to clear payment state when modal closes or user resets
    resetPaymentState: (state) => {
      state.order = null;
      state.donationDetails = null;
      state.loading = false;
      state.error = null;
      state.paymentStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Donation Order Handlers
      .addCase(createDonationOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentStatus = "loading";
      })
      .addCase(createDonationOrder.fulfilled, (state, action: PayloadAction<CreateOrderResponse>) => {
        state.loading = false;
        state.order = action.payload.order;
        state.paymentStatus = "idle"; // Order created, waiting for user action in Razorpay popup
      })
      .addCase(createDonationOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
        state.paymentStatus = "failed";
      })

      // Verify Donation Handlers
      .addCase(verifyDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentStatus = "loading";
      })
      .addCase(verifyDonation.fulfilled, (state, action: PayloadAction<VerifyPaymentResponse>) => {
        state.loading = false;
        state.donationDetails = action.payload.donation || null;
        state.paymentStatus = "success";
      })
      .addCase(verifyDonation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Verification failed";
        state.paymentStatus = "failed";
      });
  },
});

// Export sync actions
export const { resetPaymentState } = paymentSlice.actions;

// Export the reducer as DEFAULT to fix your import error 🎉
export default paymentSlice.reducer;