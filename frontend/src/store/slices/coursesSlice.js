import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCourses } from "../../api/coursesApi";

export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await getCourses(params);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load courses");
    }
  },
);

const resetState = () => ({
  list: [],
  status: "idle",
  error: null,
});

const coursesSlice = createSlice({
  name: "courses",
  initialState: resetState(),
  reducers: {
    markCoursesStale: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message || null;
      })
      .addMatcher(
        (action) => action.type === "auth/clearAuth",
        () => resetState(),
      );
  },
});

export const { markCoursesStale } = coursesSlice.actions;

export const selectCourseList = (state) => state.courses.list;
export const selectCoursesStatus = (state) => state.courses.status;
export const selectCoursesError = (state) => state.courses.error;

export default coursesSlice.reducer;
