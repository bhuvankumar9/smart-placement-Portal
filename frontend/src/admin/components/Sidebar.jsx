import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Trophy,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("adminSidebarWidth");
    return saved ? parseInt(saved) : 256; // Default 256px (w-64)
  });
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      const newWidth = e.clientX - sidebar.getBoundingClientRect().left;

      // Set min and max width constraints
      if (newWidth >= 80 && newWidth <= 600) {
        setSidebarWidth(newWidth);
        localStorage.setItem("adminSidebarWidth", newWidth);
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

  const handleResizeStart = () => {
    setIsDragging(true);
  };

  // Determine if sidebar is collapsed based on width
  const isCollapsed = sidebarWidth < 220;

  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin/students", label: "Students", icon: <Users size={20} /> },
    { to: "/admin/courses", label: "Courses", icon: <BookOpen size={20} /> },
    {
      to: "/admin/internships",
      label: "Internships",
      icon: <Briefcase size={20} />,
    },
    { to: "/admin/jobs", label: "Jobs", icon: <BriefcaseBusiness size={20} /> },
    {
      to: "/admin/placed-students",
      label: "Placed Students",
      icon: <Trophy size={20} />,
    },
  ];

  const navContent = (
    <>
      <div
        className={`p-5 flex items-center gap-2 mb-8 transition-all duration-200 ${isCollapsed ? "justify-center" : ""}`}
      >
        <div className="bg-red-600 p-1.5 rounded-lg text-white flex-shrink-0">
          <BookOpen size={24} />
        </div>
        {!isCollapsed && (
          <h1 className="font-bold text-xl tracking-tight whitespace-nowrap">
            NETLEAP
          </h1>
        )}
      </div>

      <nav className="flex flex-col">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            onClick={onClose}
            title={isCollapsed ? item.label : ""}
            className={({ isActive }) =>
              `flex items-center transition-all duration-200 border-l-4 ${
                isCollapsed ? "justify-center px-4 py-4" : "gap-3 px-6 py-4"
              } ${
                isActive
                  ? "bg-red-50 text-red-600 border-red-600 font-bold"
                  : "text-gray-400 border-transparent hover:bg-gray-50 hover:text-gray-600"
              }`
            }
          >
            {item.icon}
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside
        ref={sidebarRef}
        className="hidden lg:flex bg-white border-r h-screen shadow-sm flex-col shrink-0 relative group transition-all"
        style={{ width: `${sidebarWidth}px` }}
      >
        {navContent}

        {/* Resizable Border */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute right-0 top-0 h-full w-1 bg-gray-200 hover:bg-red-600 cursor-col-resize opacity-0 group-hover:opacity-100 transition-all"
          style={{
            userSelect: isDragging ? "none" : "auto",
            cursor: isDragging ? "col-resize" : "col-resize",
          }}
        />
      </aside>

      <div
        className={`lg:hidden fixed inset-0 bg-slate-900/40 transition-opacity z-40 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-[85vw] max-w-[320px] bg-white border-r shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-end p-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center justify-center rounded-sm cursor-pointer"
              aria-label="Close admin navigation"
            >
              <X size={18} />
            </motion.button>
          </div>
          {navContent}
        </div>
      </aside>
    </>
  );
}
