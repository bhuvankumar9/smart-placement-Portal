import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCurrentUser } from "../../api/authApi";

const STUDENT_AUTH_KEY = "student_auth";

const readStoredStudent = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STUDENT_AUTH_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed?.id
      ? {
          id: String(parsed.id),
          name: parsed.name || "Student",
          email: parsed.email || "student@example.com",
          domain: parsed.domain || "",
          education: parsed.education || "",
          college: parsed.college || "",
          phone: parsed.phone || "",
        }
      : null;
  } catch {
    return null;
  }
};

const persistStudent = (student) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!student?.id) {
    window.localStorage.removeItem(STUDENT_AUTH_KEY);
    return;
  }

  window.localStorage.setItem(
    STUDENT_AUTH_KEY,
    JSON.stringify({
      id: String(student.id),
      name: student.name || "",
      email: student.email || "",
      domain: student.domain || "",
      education: student.education || "",
      college: student.college || "",
      phone: student.phone || "",
    }),
  );
};

const storedStudent = readStoredStudent();

const initialState = {
  user: storedStudent,
  role: storedStudent ? "student" : null,
  isAuthenticated: Boolean(storedStudent),
  status: "idle",
  error: null,
};

const buildStudentUser = (user) => ({
  id: String(user.id),
  name: user.name || "Student",
  email: user.email || "student@example.com",
  domain: user.domain || "",
  education: user.education || "",
  college: user.college || "",
  phone: user.phone || "",
});

const buildAdminUser = (user) => ({
  id: String(user?.id) || null,
  name: user?.name || "Admin",
  email: user?.email || "admin@example.com",
});

export const hydrateCurrentUser = createAsyncThunk(
  "auth/hydrateCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Unable to load current user",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setStudentAuth: (state, action) => {
      const student = action.payload;
      state.user = buildStudentUser(student);
      state.role = "student";
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
      persistStudent(state.user);
    },
    setAdminAuth: (state, action) => {
      state.user = buildAdminUser(action.payload);
      state.role = "admin";
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
      persistStudent(null);
    },
    clearAuth: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      persistStudent(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(hydrateCurrentUser.fulfilled, (state, action) => {
        const response = action.payload;
        const role = response?.role || null;
        const user = response?.user || null;

        if (role === "student" && user?.id) {
          state.user = buildStudentUser(user);
          state.role = "student";
          state.isAuthenticated = true;
          persistStudent(state.user);
        } else if (role === "admin") {
          state.user = buildAdminUser(user);
          state.role = "admin";
          state.isAuthenticated = true;
          persistStudent(null);
        } else {
          state.user = null;
          state.role = null;
          state.isAuthenticated = false;
          persistStudent(null);
        }

        state.status = "succeeded";
        state.error = null;
      })
      .addCase(hydrateCurrentUser.rejected, (state, action) => {
        const fallbackStudent = readStoredStudent();

        if (fallbackStudent?.id) {
          state.user = fallbackStudent;
          state.role = "student";
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.role = null;
          state.isAuthenticated = false;
        }

        state.status = "failed";
        state.error = action.payload || action.error?.message || null;
      });
  },
});

export const { setStudentAuth, setAdminAuth, clearAuth } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectAuthStatus = (state) => state.auth.status;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsStudent = (state) =>
  state.auth.role === "student" && Boolean(state.auth.user?.id);
export const selectStudentId = (state) => state.auth.user?.id || null;
export const selectStudentInfo = (state) => {
  const user = state.auth.user;

  return {
    id: user?.id || null,
    name: user?.name || "Student",
    subtitle: user?.domain || "Welcome back",
    email: user?.email || "student@example.com",
    domain: user?.domain || "",
    education: user?.education || "",
    college: user?.college || "",
    phone: user?.phone || "",
  };
};

export const selectAdminInfo = (state) => {
  const user = state.auth.user;

  return {
    id: user?.id || null,
    name: user?.name || "Admin",
    email: user?.email || "admin@example.com",
    subtitle: "Super Admin",
  };
};

export default authSlice.reducer;
