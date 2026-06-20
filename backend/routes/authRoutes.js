import express from "express";
import {
  studentRegister,
  verifyStudentRegisterOtp,
  studentLogin,
  adminRegister,
  adminLogin,
  me,
  logout,
//   studentForgotPassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/student/register", studentRegister);
router.post("/auth/student/register/verify-otp", verifyStudentRegisterOtp);
router.post("/auth/student/login", studentLogin);
// router.post("/auth/student/forgot-password", studentForgotPassword);
router.post("/auth/admin/register", adminRegister);
router.post("/auth/admin/login", adminLogin);
router.get("/auth/me", verifyToken, me);
router.post("/auth/logout", logout);

export default router;
