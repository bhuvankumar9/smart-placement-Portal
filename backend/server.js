import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import internRoutes from "./routes/internRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import courseEnrollmentRoutes from "./routes/courseEnrollmentRoutes.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import placedStudentRoutes from "./routes/placedStudentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import connectDB from "./config/db.js";

// These imports still matter in Mongoose: they make sure every schema is
// registered with mongoose.model(...) before any controller tries to use it.
import "./models/studentsModel.js";
import "./models/adminModel.js";
import "./models/internModel.js";
import "./models/internshipModel.js";
import "./models/courseModel.js";
import "./models/courseEnrollmentModel.js";
import "./models/jobsModel.js";
import "./models/placedStudentModel.js";

dotenv.config();

const app = express();
const allowedOrigins = process.env.CLIENT_URLS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// ============ API ROUTES ============
app.use("/api", authRoutes);
app.use("/api", studentRoutes);
app.use("/api", internRoutes);
app.use("/api", internshipRoutes);
app.use("/api", courseRoutes);
app.use("/api", courseEnrollmentRoutes);
app.use("/api", jobsRoutes);
app.use("/api", placedStudentRoutes);
app.use("/api", dashboardRoutes);

// ============ HEALTH CHECK ============
app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend is running",
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ============ ROOT ENDPOINT ============
app.get("/", (req, res) => {
  res.json({
    message: "NITS Dashboard Backend",
    version: "1.0.0",
    status: "running",
  });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Mongoose doesn't need a "sync" step like Sequelize — collections are
    // created automatically the first time a document is inserted.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV}`);
      console.log(`✅ API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err.message);
    process.exit(1);
  }
};

startServer();

export default app;
