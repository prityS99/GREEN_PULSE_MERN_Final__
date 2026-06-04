import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { govtOfficerService } from "../../../services/api";

interface GovtOfficerState {
  eliteNgos: any[];
  verifiedImpact: any | null;
  loading: boolean;
}

const initialState: GovtOfficerState = { eliteNgos: [], verifiedImpact: null, loading: false };

export const fetchEliteNgos = createAsyncThunk("govt/fetchElite", async () => await govtOfficerService.viewEliteNgos());
export const checkImpactData = createAsyncThunk("govt/verifyImpact", async (ngoId: string) => await govtOfficerService.verifyImpactData(ngoId));
export const submitNomination = createAsyncThunk("govt/nominate", async (data: any) => await govtOfficerService.nominateForAward(data));

const govtOfficerSlice = createSlice({
  name: "govtOfficer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEliteNgos.fulfilled, (state, action) => { state.eliteNgos = action.payload; })
      .addCase(checkImpactData.fulfilled, (state, action) => { state.verifiedImpact = action.payload; });
  }
});
export default govtOfficerSlice.reducer;