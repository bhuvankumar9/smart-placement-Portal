import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stipend: {
      type: Number,
    },
    work_type: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Open",
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Internship = mongoose.model("Internship", internshipSchema);

export { Internship };
