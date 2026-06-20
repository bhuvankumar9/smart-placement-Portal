import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";
import { Student } from "../models/studentsModel.js";
import { Admin } from "../models/adminModel.js";
import { redis } from "../config/redis.js";

const cookieName = "token";
const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS) || 300;

const buildToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "nits-secret", {
    expiresIn: "7d",
  });
};

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

const setAuthCookie = (res, token) => {
  res.cookie(cookieName, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(cookieName, getCookieOptions());
};

const getRegisterOtpKey = (email) => {
  return `otp:student:register:${email.toLowerCase().trim()}`;
};

const studentRegister = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    gender,
    DOB,
    education,
    college,
    domain,
  } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      message: "name, email, phone and password are required",
    });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existingStudent = await Student.findOne({ email: normalizedEmail });

    if (existingStudent) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = getRegisterOtpKey(normalizedEmail);

    await redis.set(
      otpKey,
      JSON.stringify({
        otp,
        studentData: {
          name,
          email: normalizedEmail,
          phone,
          password: hashedPassword,
          gender,
          DOB,
          education,
          college,
          domain,
        },
      }),
      "EX",
      OTP_TTL_SECONDS,
    );

    try {
      await sendMail(
        normalizedEmail,
        "Verify OTP",
        `Your OTP is ${otp}. It will expire in ${Math.floor(OTP_TTL_SECONDS / 60)} minutes.`,
      );
    } catch {
      await redis.del(otpKey);
      return res.status(503).json({
        message: "Unable to send OTP email right now. Please try again.",
      });
    }

    return res.status(200).json({
      message: "OTP sent to your email. Verify OTP to complete registration.",
      email: normalizedEmail,
      expiresInSeconds: OTP_TTL_SECONDS,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyStudentRegisterOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "email and otp are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const otpKey = getRegisterOtpKey(normalizedEmail);
    const pendingRegistration = await redis.get(otpKey);

    if (!pendingRegistration) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    const parsed = JSON.parse(pendingRegistration);

    if (parsed.otp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const existingStudent = await Student.findOne({ email: normalizedEmail });
    if (existingStudent) {
      await redis.del(otpKey);
      return res.status(409).json({ message: "Email already registered" });
    }

    const student = await Student.create(parsed.studentData);
    await redis.del(otpKey);

    setAuthCookie(res, buildToken({ id: student._id.toString(), role: "student" }));
    return res.status(201).json({
      message: "Student registered successfully",
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const studentLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    setAuthCookie(res, buildToken({ id: student._id.toString(), role: "student" }));
    res.status(200).json({
      message: "Student login successful",
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminRegister = async (req, res) => {
  const { name, email, password, setupKey } = req.body;

  if (!name || !email || !password || !setupKey) {
    return res.status(400).json({
      message: "name, email, password and setupKey are required",
    });
  }

  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ message: "Invalid admin setup key" });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    setAuthCookie(res, buildToken({ id: admin._id.toString(), role: "admin" }));
    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    setAuthCookie(res, buildToken({ id: admin._id.toString(), role: "admin" }));
    res.status(200).json({
      message: "Admin login successful",
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const me = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const student = await Student.findById(req.user.id).select(
        "-password",
      );

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res.status(200).json({ role: "student", user: student });
    }

    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({ role: "admin", user: admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out successfully" });
};

export {
  studentRegister,
  verifyStudentRegisterOtp,
  studentLogin,
  adminRegister,
  adminLogin,
  me,
  logout,
};
