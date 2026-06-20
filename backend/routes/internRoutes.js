import express from "express";
import {
  getAllInterns,
  getInternById,
  createIntern,
  updateIntern,
  deleteIntern,
} from "../controllers/internController.js";

const router = express.Router();

router.post("/interns", createIntern);
router.get("/interns", getAllInterns);
router.get("/interns/:id", getInternById);
router.put("/interns/:id", updateIntern);
router.delete("/interns/:id", deleteIntern);

export default router;
