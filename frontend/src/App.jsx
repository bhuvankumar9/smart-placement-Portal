import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import StudentNavbar from "./components/StudentNavbar";
import SettingsModal from "./components/SettingsModal";
import { selectTheme } from "./store/slices/uiSlice";
// Page Components
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Jobs from "./pages/Jobs";
import Internships from "./pages/Internships";
import AboutPortal from "./pages/AboutPortal";
import StudentProfile from "./pages/StudentProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Adminapp from "./admin/Adminapp";
import { hydrateCurrentUser } from "./store/slices/authSlice";

// Student layout — only wraps student-facing pages
const StudentLayout = () => {
  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <StudentNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 text-gray-800">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  useEffect(() => {
    dispatch(hydrateCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <SettingsModal />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes — render with their own admin layout, no student UI */}
        <Route path="/admin/*" element={<Adminapp />} />

        {/* Student routes — wrapped in student sidebar + navbar */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/about" element={<AboutPortal />} />
          <Route path="/profile/:id" element={<StudentProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
