import { Menu, Search, Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import "./StudentNavbar.css";
import {
  hydrateCurrentUser,
  selectAuthStatus,
  selectStudentInfo,
} from "../store/slices/authSlice";
import { openStudentNav } from "../store/slices/uiSlice";
import { motion } from "framer-motion";

const searchableStudentRoutes = new Set(["/jobs", "/internships", "/courses"]);

const StudentNavbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);
  const studentInfo = useSelector(selectStudentInfo);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (authStatus === "idle") {
      dispatch(hydrateCurrentUser());
    }
  }, [authStatus, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get("q") || "");
  }, [location.search]);

  const updateSearchRoute = (value, replace = false) => {
    const trimmedValue = value.trim();
    const targetPath = searchableStudentRoutes.has(location.pathname)
      ? location.pathname
      : "/jobs";
    const params = new URLSearchParams();

    if (trimmedValue) {
      params.set("q", trimmedValue);
    }

    navigate(
      {
        pathname: targetPath,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace },
    );
  };

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;
    setSearchValue(nextValue);

    if (searchableStudentRoutes.has(location.pathname)) {
      updateSearchRoute(nextValue, true);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateSearchRoute(searchValue);
  };

  return (
    <>
      <header className="student-navbar">
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          className="student-menu-btn rounded-sm cursor-pointer"
          onClick={() => dispatch(openStudentNav())}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </motion.button>

        <h2 className="student-navbar-title">Student Portal</h2>

        <div className="student-navbar-actions">
          <form className="student-search-wrap" onSubmit={handleSearchSubmit}>
            <Search className="student-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search jobs, events..."
              className="student-search-input"
              value={searchValue}
              onChange={handleSearchChange}
              aria-label="Search student listings"
            />
          </form>

          {/* <motion.button whileTap={{ scale: 0.9 }}
            type="button"
            className="student-icon-btn rounded-sm cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={22} />
          </motion.button> */}

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="student-profile-btn rounded-sm cursor-pointer"
            aria-label="Open student profile menu"
            onClick={() => setIsSidebarOpen(true)}
          >
            <div className="student-profile-meta">
              <p className="student-name">{studentInfo.name}</p>
              <p className="student-subtitle">{studentInfo.subtitle}</p>
            </div>
            <span className="student-profile-avatar">
              <User size={22} />
            </span>
          </motion.button>
        </div>
      </header>

      <StudentSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        studentInfo={studentInfo}
      />
    </>
  );
};

export default StudentNavbar;
