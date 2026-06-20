import express from "express";
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
} from "../controllers/internshipController.js";

const router = express.Router();

router.post("/internships", createInternship);
router.get("/internships", getAllInternships);
router.get("/internships/:id", getInternshipById);
router.put("/internships/:id", updateInternship);
router.delete("/internships/:id", deleteInternship);

export default router;
