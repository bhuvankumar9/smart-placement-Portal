import mongoose from "mongoose";
import { Student } from "../models/studentsModel.js";
import { CourseEnrollment } from "../models/courseEnrollmentModel.js";
import { Intern } from "../models/internModel.js";
import { PlacedStudent } from "../models/placedStudentModel.js";
import bcrypt from "bcrypt";
import { redis } from "../config/redis.js";

const getAllStudents = async (req, res) => {
  if (await redis.exists("students")) {
    const cachedStudents = await redis.get("students");
    return res.status(200).json(JSON.parse(cachedStudents));
  }
  try {
    const students = await Student.find();
    await redis.set("students", JSON.stringify(students));
    await redis.expire("students", 10);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create student
const createStudent = async (req, res) => {
  try {
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

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = await Student.create({
      name,
      email,
      phone,
      password: hashedPassword,
      gender,
      DOB,
      education,
      college,
      domain,
    });

    return res.status(201).json(newStudent);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Update student by ID
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  const studentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: "Invalid student id" });
  }

  // NOTE: Mongo transactions require the DB to be running as a replica set.
  // MongoDB Atlas (even the free tier) is a replica set by default, so this
  // works there out of the box. A plain local "mongod" needs extra setup.
  const session = await mongoose.startSession();

  try {
    let result = null;

    await session.withTransaction(async () => {
      const student = await Student.findById(studentId).session(session);

      if (!student) {
        return; // result stays null -> handled below as 404
      }

      const deletedInterns = await Intern.deleteMany(
        { studentId },
        { session },
      );

      const deletedPlacedStudents = await PlacedStudent.deleteMany(
        { studentId },
        { session },
      );

      const deletedCourseEnrollments = await CourseEnrollment.deleteMany(
        { studentId },
        { session },
      );

      await Student.findByIdAndDelete(studentId, { session });

      result = {
        deletedInterns: deletedInterns.deletedCount,
        deletedPlacedStudents: deletedPlacedStudents.deletedCount,
        deletedCourseEnrollments: deletedCourseEnrollments.deletedCount,
      };
    });

    if (!result) {
      return res.status(404).json({ message: "Student not found" });
    }

    try {
      await redis.del("students");
    } catch (cacheError) {
      console.error("Failed to invalidate students cache:", cacheError.message);
    }

    res.status(200).json({
      message: "Student and related records deleted successfully",
      deletedRelated: {
        interns: result.deletedInterns,
        placedStudents: result.deletedPlacedStudents,
        courseEnrollments: result.deletedCourseEnrollments,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export default {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
