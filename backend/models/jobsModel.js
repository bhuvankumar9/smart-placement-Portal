import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
    },
    jobURL: {
      type: String,
    },
    description: {
      type: String,
    },
    requirements: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Job = mongoose.model("Job", jobSchema);

export { Job };
