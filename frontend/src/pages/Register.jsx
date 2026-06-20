import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerSendOtp, registerVerifyOtp } from "../api/authApi";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();

  // Step 1: Registration Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    DOB: "",
    education: "",
    college: "",
    domain: "",
  });

  // Step 2: OTP State
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);

  // Status State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await registerSendOtp(formData);
      setSuccessMsg(response.message || "OTP sent to your email!");
      setExpiresIn(response.expiresInSeconds || 300);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to register. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await registerVerifyOtp(formData.email, otp);
      // Registration complete, navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or OTP expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            {step === 1 ? "Create an Account" : "Verify Your Email"}
          </h2>
          <p className="text-gray-500 mt-2">
            {step === 1
              ? "Join the student placement portal"
              : `Enter the 6-digit OTP sent to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-6 font-medium text-sm">
            {successMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
                  placeholder="e.g. B.Tech"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College/Institute
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
                  placeholder="e.g. NIT Silchar"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain/Interest
              </label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transiton-colors"
                placeholder="e.g. Web Development"
              />
            </div>

            <motion.button whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={loading}
              className={`rounded-sm w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-sm transition-colors mt-6 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Sending OTP..." : "Register & Send OTP"}
            </motion.button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-[0.5em] text-2xl font-bold border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••"
              />
            </div>

            <motion.button whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={loading || otp.length < 6}
              className={`rounded-sm w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-sm transition-colors mt-4 ${loading || otp.length < 6 ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>

            <div className="text-center mt-4">
              <motion.button whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => {
                  setStep(1);
                  setSuccessMsg("");
                  setError("");
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Registration
              </motion.button>
            </div>
          </form>
        )}

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
