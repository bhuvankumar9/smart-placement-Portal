import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true, // beginner, intermediate, advanced
    },
    instructor: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Active",
    },
    branch: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      required: true,
    },
    what_you_will_learn: {
      type: String,
    },
    course_features: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Course = mongoose.model("Course", courseSchema);

export { Course };
