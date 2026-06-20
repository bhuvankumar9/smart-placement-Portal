import express from "express";
const router = express.Router();
import studentController from "../controllers/studentController.js";

router.post("/students", studentController.createStudent);
router.get("/students", studentController.getAllStudents);
router.get("/students/:id", studentController.getStudentById);
router.put("/students/:id", studentController.updateStudent);
router.delete("/students/:id", studentController.deleteStudent);

export default router;
