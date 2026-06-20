import express from "express";
import dashboardController from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboard/admin", dashboardController.getAdminDashboard);

export default router;
