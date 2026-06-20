import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getJobs } from "../../api/jobsApi";

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getJobs();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load jobs");
    }
  },
);

const resetState = () => ({
  list: [],
  appliedIds: [],
  status: "idle",
  error: null,
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState: resetState(),
  reducers: {
    markJobsStale: (state) => {
      state.status = "idle";
    },
    // Called after writing to localStorage so Redux mirrors it
    setAppliedJobIds: (state, action) => {
      state.appliedIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message || null;
      })
      .addMatcher(
        (action) => action.type === "auth/clearAuth",
        () => resetState(),
      );
  },
});

export const { markJobsStale, setAppliedJobIds } = jobsSlice.actions;

export const selectJobList = (state) => state.jobs.list;
export const selectJobsStatus = (state) => state.jobs.status;
export const selectJobsError = (state) => state.jobs.error;
export const selectAppliedJobIds = (state) => state.jobs.appliedIds;

export default jobsSlice.reducer;
