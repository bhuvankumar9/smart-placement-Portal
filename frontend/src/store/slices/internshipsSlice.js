import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getInternships } from "../../api/internshipsApi";

export const fetchInternships = createAsyncThunk(
  "internships/fetchInternships",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getInternships();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load internships");
    }
  },
);

const resetState = () => ({
  list: [],
  appliedIds: [],
  status: "idle",
  error: null,
});

const internshipsSlice = createSlice({
  name: "internships",
  initialState: resetState(),
  reducers: {
    markInternshipsStale: (state) => {
      state.status = "idle";
    },
    // Called after writing to localStorage so Redux mirrors it
    setAppliedInternshipIds: (state, action) => {
      state.appliedIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInternships.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInternships.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchInternships.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message || null;
      })
      .addMatcher(
        (action) => action.type === "auth/clearAuth",
        () => resetState(),
      );
  },
});

export const { markInternshipsStale, setAppliedInternshipIds } =
  internshipsSlice.actions;

export const selectInternshipList = (state) => state.internships.list;
export const selectInternshipsStatus = (state) => state.internships.status;
export const selectInternshipsError = (state) => state.internships.error;
export const selectAppliedInternshipIds = (state) =>
  state.internships.appliedIds;

export default internshipsSlice.reducer;
