import { X, Sun, Moon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleTheme,
  closeSettings,
  selectTheme,
  selectIsSettingsOpen,
} from "../store/slices/uiSlice";
import { motion, AnimatePresence } from "framer-motion";

const SettingsModal = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const isOpen = useSelector(selectIsSettingsOpen);

  const handleClose = () => {
    dispatch(closeSettings());
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Settings
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                  aria-label="Close settings"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Theme Switcher */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-slate-700">
                  <div className="flex items-center space-x-3">
                    {theme === "light" ? (
                      <Sun size={20} className="text-yellow-500" />
                    ) : (
                      <Moon size={20} className="text-indigo-400" />
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {theme === "light" ? "Light Mode" : "Dark Mode"}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleThemeToggle}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      theme === "dark" ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                  >
                    <motion.span
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-colors ${
                        theme === "dark" ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </motion.button>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-800 dark:text-white rounded-lg font-medium transition"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
