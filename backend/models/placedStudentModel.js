import mongoose from "mongoose";

const placedStudentSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
    },
    placementDate: {
      type: Date,
      required: true,
    },
    img: {
      type: String,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PlacedStudent = mongoose.model("PlacedStudent", placedStudentSchema);

export { PlacedStudent };
