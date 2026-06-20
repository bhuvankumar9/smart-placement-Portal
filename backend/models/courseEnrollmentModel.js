import mongoose from "mongoose";

const courseEnrollmentSchema = new mongoose.Schema(
  {
    // ObjectId + ref replaces Sequelize's "references: { model, key }" foreign key
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "active",
    },
    enrolledAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Replaces the SQL UNIQUE KEY (studentId, courseId) — prevents double-enrollment
courseEnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const CourseEnrollment = mongoose.model(
  "CourseEnrollment",
  courseEnrollmentSchema,
);

export { CourseEnrollment };
