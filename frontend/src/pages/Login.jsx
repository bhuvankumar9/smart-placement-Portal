import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin, loginStudent } from "../api/authApi";
import { setAdminAuth, setStudentAuth } from "../store/slices/authSlice";
import { motion } from "framer-motion";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (role === "admin") {
        const loginResponse = await loginAdmin({ email, password });
        dispatch(
          setAdminAuth(
            loginResponse?.admin || {
              name: "Admin",
              email,
            },
          ),
        );
        navigate("/admin", { replace: true });
      } else {
        const loginResponse = await loginStudent({ email, password });
        const student = loginResponse?.student;

        if (student?.id) {
          dispatch(setStudentAuth(student));
        }

        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Log in to your portal</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Login As
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <motion.button whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={loading}
            className={`rounded-sm w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-sm transition-colors mt-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing in..." : "Log In"}
          </motion.button>
        </form>

        {role === "student" && (
          <p className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
