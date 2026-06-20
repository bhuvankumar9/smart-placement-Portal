import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  User,
  X,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { logoutUser } from "../../api/authApi";
import { clearAuth, selectAdminInfo } from "../../store/slices/authSlice";
import { motion } from "framer-motion";

const searchableAdminRoutes = new Set([
  "/admin/students",
  "/admin/courses",
  "/admin/internships",
  "/admin/jobs",
]);

export default function Navbar({ onOpenSidebar = () => {} }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const adminInfo = useSelector(selectAdminInfo);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get("q") || "");
  }, [location.search]);

  const initials =
    String(adminInfo.name || "A")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AD";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Continue logout locally even if request fails.
    }

    dispatch(clearAuth());
    setIsDrawerOpen(false);
    navigate("/login", { replace: true });
  };

  const updateSearchRoute = (value, replace = false) => {
    const trimmedValue = value.trim();
    const targetPath = searchableAdminRoutes.has(location.pathname)
      ? location.pathname
      : "/admin/students";
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

    if (searchableAdminRoutes.has(location.pathname)) {
      updateSearchRoute(nextValue, true);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateSearchRoute(searchValue);
  };

  return (
    <>
      <div className="bg-white border-b px-4 md:px-6 lg:px-8 py-4 flex justify-between items-center gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center justify-center rounded-sm cursor-pointer"
            aria-label="Open admin navigation"
          >
            <Menu size={20} />
          </motion.button>
          <h2 className="font-bold text-lg md:text-xl text-gray-800 truncate">
            Admin Panel
          </h2>
        </div>

        <form
          className="relative hidden md:flex items-center flex-1 max-w-xs lg:max-w-md xl:max-w-lg"
          onSubmit={handleSearchSubmit}
        >
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input
            className="border border-gray-300 rounded-none pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-medium text-gray-700"
            placeholder="Search students, courses, or jobs..."
            value={searchValue}
            onChange={handleSearchChange}
            aria-label="Search admin records"
          />
        </form>

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          {/* <motion.button whileTap={{ scale: 0.9 }} className="relative text-gray-600 hover:text-red-600 transition-colors rounded-sm cursor-pointer">
            <Bell size={20} />
            <span className="absolute -top-3 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.4 rounded-full border-2 border-white">
              3
            </span>
          </motion.button> */}

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 md:gap-3 bg-gray-50 px-2.5 md:px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 cursor-pointer transition-all"
          >
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-bold text-gray-800 leading-tight">
                {adminInfo.name}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {adminInfo.subtitle}
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-slate-900/40 transition-opacity z-40 ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden={!isDrawerOpen}
      />

      <aside
        className={`fixed top-0 right-0 h-screen w-[85vw] sm:w-[25vw] sm:min-w-[300px] sm:max-w-[460px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isDrawerOpen}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Admin Panel</h3>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center justify-center"
              aria-label="Close admin drawer"
            >
              <X size={18} />
            </motion.button>
          </div>

          <div className="mt-6 pb-6 border-b border-gray-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <User size={28} />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {adminInfo.name}
            </p>
            <p className="text-sm text-gray-500">{adminInfo.subtitle}</p>
            <p className="mt-1 text-xs text-gray-400">{adminInfo.email}</p>
          </div>

          <nav className="mt-5 space-y-2">
            {/* <motion.button whileTap={{ scale: 0.9 }}
              type="button"
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center gap-2 rounded-sm cursor-pointer"
            >
              <ShieldCheck size={18} />
              Account Security
            </motion.button> */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center gap-2 rounded-sm cursor-pointer"
            >
              <Settings size={18} />
              Settings
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 rounded-sm cursor-pointer"
            >
              <LogOut size={18} />
              Logout
            </motion.button>
          </nav>
        </div>
      </aside>
    </>
  );
}
