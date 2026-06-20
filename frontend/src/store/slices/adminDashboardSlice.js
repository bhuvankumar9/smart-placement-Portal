import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAdminDashboard } from "../../api/adminDashboardApi";

const fallbackDashboard = {
  stats: {
    totalStudents: 0,
    activeCourses: 0,
    internships: 0,
    placements: 0,
  },
  recentStudents: [],
};

export const fetchAdminDashboard = createAsyncThunk(
  "adminDashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminDashboard();
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to load admin dashboard",
      );
    }
  },
);

const initialState = {
  data: fallbackDashboard,
  status: "idle",
  error: null,
};

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    markAdminDashboardStale: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.data = action.payload || fallbackDashboard;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message || null;
      })
      .addMatcher(
        (action) => action.type === "auth/clearAuth",
        () => initialState,
      );
  },
});

export const { markAdminDashboardStale } = adminDashboardSlice.actions;

export const selectAdminDashboardData = (state) => state.adminDashboard.data;
export const selectAdminDashboardStatus = (state) =>
  state.adminDashboard.status;
export const selectAdminDashboardError = (state) => state.adminDashboard.error;

export default adminDashboardSlice.reducer;
