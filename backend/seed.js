// One-time script to populate MongoDB with sample data so you have
// something to test against immediately after migrating.
// Run with: node seed.js
// Safe to re-run — it clears these collections first.

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { Admin } from "./models/adminModel.js";
import { Student } from "./models/studentsModel.js";
import { Course } from "./models/courseModel.js";
import { Job } from "./models/jobsModel.js";
import { Internship } from "./models/internshipModel.js";

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([
    Admin.deleteMany({}),
    Student.deleteMany({}),
    Course.deleteMany({}),
    Job.deleteMany({}),
    Internship.deleteMany({}),
  ]);

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  await Admin.create({
    name: "Admin",
    email: "admin@nits.com",
    password: adminPassword,
  });

  const studentPassword = await bcrypt.hash("Student@123", 10);
  await Student.create({
    name: "Test Student",
    email: "student@nits.com",
    phone: "9999999999",
    password: studentPassword,
    gender: "Other",
    education: "B.Tech",
    college: "NITS",
    domain: "Web Development",
  });

  await Course.create({
    title: "Full Stack Web Development",
    level: "Intermediate",
    instructor: "Jane Doe",
    duration: 12,
    branch: "CSE",
    overview: "Learn the MERN stack from scratch.",
    what_you_will_learn: "React, Node.js, Express, MongoDB",
    course_features: "Live sessions, Projects, Certificate",
  });

  await Job.create({
    position: "Frontend Developer",
    company: "Acme Corp",
    location: "Remote",
    salary: "6-8 LPA",
    description: "Build UI with React.",
  });

  await Internship.create({
    title: "Backend Intern",
    duration: 3,
    category: "Paid",
    stipend: 10000,
    work_type: "Remote",
    branch: "CSE",
    description: "Work on Node.js APIs.",
  });

  console.log("✅ Seed data inserted");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
