import express from "express";
import {
  getAllCourseEnrollments,
  getCourseEnrollmentById,
  createCourseEnrollment,
  updateCourseEnrollment,
  deleteCourseEnrollment,
} from "../controllers/courseEnrollmentController.js";

const router = express.Router();

router.post("/course-enrollments", createCourseEnrollment);
router.get("/course-enrollments", getAllCourseEnrollments);
router.get("/course-enrollments/:id", getCourseEnrollmentById);
router.put("/course-enrollments/:id", updateCourseEnrollment);
router.delete("/course-enrollments/:id", deleteCourseEnrollment);

export default router;
