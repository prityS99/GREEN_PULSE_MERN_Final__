import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/api"; 

/* =========================================================
   TYPES
========================================================= */

export interface NGO {
  _id: string;
  ngoName: string;
  about?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  ngoType?: string[];
  isApproved?: boolean;
  createdAt?: string;

  userId?: {
    name?: string;
    email?: string;
    profileImage?: {
      public_id?: string;
      url: string;
    };
  };
}

interface NGOState {
  ngos: NGO[];
  singleNgo: NGO | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState: NGOState = {
  ngos: [],
  singleNgo: null,
  loading: false,
  error: null,
  success: false,
  message: null,
};

/* =========================================================
   API BASE
========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* =========================================================
   THUNKS (NO TOKEN PASSED MANUALLY)
========================================================= */

// CREATE NGO
export const addNgo = createAsyncThunk(
  "ngo/addNgo",
  async (ngoData: any, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_URL}/ngo/add`, ngoData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create NGO");
    }
  }
);

// UPDATE NGO
export const updateNgo = createAsyncThunk(
  "ngo/updateNgo",
  async (ngoData: any, { rejectWithValue }) => {
    try {
      const res = await api.put(`${API_URL}/ngo/update`, ngoData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update NGO");
    }
  }
);

// DELETE NGO
export const deleteNgo = createAsyncThunk(
  "ngo/deleteNgo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete(`${API_URL}/ngo/delete`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete NGO");
    }
  }
);

// GET SINGLE NGO
export const getSingleNgo = createAsyncThunk(
  "ngo/getSingleNgo",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_URL}/ngo/single/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch NGO");
    }
  }
);

// GET ALL NGOs
export const getAllNgos = createAsyncThunk(
  "ngo/getAllNgos",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_URL}/ngo/all`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch NGOs");
    }
  }
);

/* =========================================================
   SLICE
========================================================= */

const ngoSlice = createSlice({
  name: "ngo",
  initialState,

  reducers: {
    resetNgoState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= ADD NGO ================= */
      .addCase(addNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNgo.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "NGO created successfully";

        const data = action.payload?.data;
        if (data) state.ngos.unshift(data);
      })
      .addCase(addNgo.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE NGO ================= */
      .addCase(updateNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNgo.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "NGO updated successfully";

        const updated = action.payload?.data;
        if (updated?._id) {
          state.singleNgo = updated;

          state.ngos = state.ngos.map((ngo) =>
            ngo._id === updated._id ? updated : ngo
          );
        }
      })
      .addCase(updateNgo.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= DELETE NGO ================= */
      .addCase(deleteNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNgo.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "NGO deleted successfully";
      })
      .addCase(deleteNgo.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= SINGLE NGO ================= */
      .addCase(getSingleNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleNgo.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.singleNgo = action.payload?.data ?? null;
      })
      .addCase(getSingleNgo.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= ALL NGOs ================= */
      .addCase(getAllNgos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllNgos.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;

        const data = action.payload?.data;
        state.ngos = Array.isArray(data) ? data : [];
      })
      .addCase(getAllNgos.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.ngos = [];
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const { resetNgoState } = ngoSlice.actions;
export default ngoSlice.reducer;