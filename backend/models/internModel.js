import mongoose from "mongoose";

const internSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true, // paid or free
    },
    stipend: {
      type: Number,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  {
    timestamps: true,
  },
);

const Intern = mongoose.model("Intern", internSchema);

export { Intern };
