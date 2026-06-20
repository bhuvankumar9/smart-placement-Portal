import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isStudentNavOpen: false,
  theme: localStorage.getItem("theme") || "light",
  isSettingsOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openStudentNav: (state) => {
      state.isStudentNavOpen = true;
    },
    closeStudentNav: (state) => {
      state.isStudentNavOpen = false;
    },
    toggleStudentNav: (state) => {
      state.isStudentNavOpen = !state.isStudentNavOpen;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
      document.documentElement.setAttribute("data-theme", action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
      document.documentElement.setAttribute("data-theme", state.theme);
    },
    openSettings: (state) => {
      state.isSettingsOpen = true;
    },
    closeSettings: (state) => {
      state.isSettingsOpen = false;
    },
  },
});

export const {
  openStudentNav,
  closeStudentNav,
  toggleStudentNav,
  setTheme,
  toggleTheme,
  openSettings,
  closeSettings,
} = uiSlice.actions;
export const selectIsStudentNavOpen = (state) => state.ui.isStudentNavOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectIsSettingsOpen = (state) => state.ui.isSettingsOpen;

export default uiSlice.reducer;
