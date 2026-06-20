import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobsController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getJobById);
router.post("/jobs", verifyToken, authorizeRoles("admin"), createJob);
router.put("/jobs/:id", verifyToken, authorizeRoles("admin"), updateJob);
router.delete("/jobs/:id", verifyToken, authorizeRoles("admin"), deleteJob);

export default router;
