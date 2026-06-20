import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCourseEnrollmentCountByStudent } from "../../api/courseEnrollmentsApi";
import { getStudentAppliedCounts } from "../../utils/studentActivity";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (studentId, { rejectWithValue }) => {
    if (!studentId) {
      return { enrolledCourses: 0, jobsApplied: 0, internshipsApplied: 0 };
    }

    try {
      let enrolledCourses = 0;
      try {
        enrolledCourses = await getCourseEnrollmentCountByStudent(studentId);
      } catch {
        enrolledCourses = 0;
      }

      const appliedCounts = getStudentAppliedCounts(studentId);

      return {
        enrolledCourses,
        jobsApplied: appliedCounts.jobsApplied,
        internshipsApplied: appliedCounts.internshipsApplied,
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to load dashboard stats",
      );
    }
  },
);

const initialState = {
  stats: {
    enrolledCourses: 0,
    jobsApplied: 0,
    internshipsApplied: 0,
  },
  // 'idle' → not yet fetched
  // 'loading' → fetch in flight
  // 'succeeded' → data cached, skip re-fetch on next mount
  // 'failed' → last fetch errored
  status: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Dispatch this after user applies to a job/internship (same-tab update)
    markDashboardStale: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message || null;
      })
      // Reset cached stats when the user logs out
      .addMatcher(
        (action) => action.type === "auth/clearAuth",
        () => initialState,
      );
  },
});

export const { markDashboardStale } = dashboardSlice.actions;

export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectDashboardStatus = (state) => state.dashboard.status;

export default dashboardSlice.reducer;
