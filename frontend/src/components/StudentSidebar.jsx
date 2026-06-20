import {
  X,
  UserCircle2,
  BriefcaseBusiness,
  Settings,
  LogOut,
  CircleUserRound,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/authApi";
import { clearAuth } from "../store/slices/authSlice";
import { openSettings } from "../store/slices/uiSlice";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const StudentSidebar = ({ isOpen, onClose, studentInfo }) => {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("studentSidebarWidth");
    return saved ? parseInt(saved) : 340; // Default 340px (25vw approximate)
  });
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      const newWidth = sidebar.getBoundingClientRect().right - e.clientX;

      // Set min and max width constraints
      if (newWidth >= 80 && newWidth <= 600) {
        setSidebarWidth(newWidth);
        localStorage.setItem("studentSidebarWidth", newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Determine if sidebar is collapsed based on width
  const isCollapsed = sidebarWidth < 160;
  const details = [
    { label: "Domain", value: studentInfo?.domain },
    { label: "Education", value: studentInfo?.education },
    { label: "College", value: studentInfo?.college },
    { label: "Phone", value: studentInfo?.phone },
  ].filter((item) => Boolean(item.value));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Redirect anyway to clear protected UI even if API call fails.
    }

    dispatch(clearAuth());
    onClose();
    navigate("/login", { replace: true });
  };

  const profilePath = studentInfo?.id
    ? `/profile/${studentInfo.id}`
    : "/dashboard";

  const handleSettingsClick = () => {
    dispatch(openSettings());
  };

  return (
    <>
      <div
        className={`student-sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        ref={sidebarRef}
        className={`student-sidebar ${isOpen ? "open" : ""} relative group transition-all`}
        onClick={(event) => event.stopPropagation()}
        aria-hidden={!isOpen}
        aria-label="Student quick menu"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Resizable Border */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute left-0 top-0 h-full w-1 bg-gray-200 hover:bg-red-600 cursor-col-resize opacity-0 group-hover:opacity-100 transition-all"
          style={{
            userSelect: isDragging ? "none" : "auto",
            cursor: isDragging ? "col-resize" : "col-resize",
          }}
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          className="student-sidebar-close rounded-sm cursor-pointer"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </motion.button>

        <div
          className={`student-sidebar-profile transition-all ${isCollapsed ? "text-center" : ""}`}
        >
          <div
            className={`student-avatar-wrap ${isCollapsed ? "mx-auto" : ""}`}
          >
            <CircleUserRound size={isCollapsed ? 40 : 64} />
          </div>
          {!isCollapsed && (
            <>
              <h3>{studentInfo?.name || "Student"}</h3>
              <p>{studentInfo?.email || "student@example.com"}</p>
            </>
          )}
        </div>

        {!isCollapsed && (
          <div className="student-sidebar-details">
            {details.map((detail, idx) => (
              <div key={idx} className="student-sidebar-detail-item">
                <strong>{detail.label}:</strong> <span>{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        <nav className="student-sidebar-menu" aria-label="Student menu">
          <Link
            to={profilePath}
            className={`student-menu-item transition-all ${isCollapsed ? "justify-center px-3" : ""}`}
            onClick={onClose}
            title={isCollapsed ? "My Profile" : ""}
          >
            <UserCircle2 size={18} />
            {!isCollapsed && <span>My Profile</span>}
          </Link>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className={`student-menu-item rounded-sm cursor-pointer text-left transition-all ${isCollapsed ? "justify-center px-3" : "w-full"}`}
            onClick={() => {
              handleSettingsClick();
              onClose();
            }}
            title={isCollapsed ? "Settings" : ""}
          >
            <Settings size={18} />
            {!isCollapsed && <span>Settings</span>}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className={`student-menu-item logout rounded-sm cursor-pointer transition-all ${isCollapsed ? "justify-center px-3" : ""}`}
            title={isCollapsed ? "Logout" : ""}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </motion.button>
        </nav>
      </aside>
    </>
  );
};

export default StudentSidebar;
