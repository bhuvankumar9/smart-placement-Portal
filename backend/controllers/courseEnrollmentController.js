import { CourseEnrollment } from "../models/courseEnrollmentModel.js";
import { Course } from "../models/courseModel.js";
import { Student } from "../models/studentsModel.js";

const getAllCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find();
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseEnrollmentById = async (req, res) => {
  try {
    const enrollment = await CourseEnrollment.findById(req.params.id);

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Course enrollment not found" });
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourseEnrollment = async (req, res) => {
  const { studentId, courseId, status, enrolledAt } = req.body;
  const isStudent = req.user?.role === "student";
  const resolvedStudentId = isStudent ? req.user.id : studentId;
  const resolvedCourseId = courseId;

  if (!resolvedStudentId || !resolvedCourseId) {
    return res.status(400).json({
      success: false,
      message: "studentId and courseId are required",
    });
  }

  try {
    const [student, course] = await Promise.all([
      Student.findById(resolvedStudentId),
      Course.findById(resolvedCourseId),
    ]);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const existingEnrollment = await CourseEnrollment.findOne({
      studentId: resolvedStudentId,
      courseId: resolvedCourseId,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "Student already enrolled in this course",
      });
    }

    const enrollment = await CourseEnrollment.create({
      studentId: resolvedStudentId,
      courseId: resolvedCourseId,
      status,
      enrolledAt,
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    // Mongo's duplicate-key error code replaces SequelizeUniqueConstraintError
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student already enrolled in this course",
      });
    }

    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCourseEnrollment = async (req, res) => {
  try {
    const enrollment = await CourseEnrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Course enrollment not found" });
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCourseEnrollment = async (req, res) => {
  try {
    const deleted = await CourseEnrollment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Course enrollment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Course enrollment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAllCourseEnrollments,
  getCourseEnrollmentById,
  createCourseEnrollment,
  updateCourseEnrollment,
  deleteCourseEnrollment,
};
