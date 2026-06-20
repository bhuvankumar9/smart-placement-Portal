import express from "express";
import {
  getAllPlacedStudents,
  getPlacedStudentById,
  createPlacedStudent,
  updatePlacedStudent,
  deletePlacedStudent,
} from "../controllers/placedStudentController.js";

const router = express.Router();

router.post("/placed-students", createPlacedStudent);
router.get("/placed-students", getAllPlacedStudents);
router.get("/placed-students/:id", getPlacedStudentById);
router.put("/placed-students/:id", updatePlacedStudent);
router.delete("/placed-students/:id", deletePlacedStudent);

export default router;
