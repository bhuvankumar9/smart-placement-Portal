import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
    },
    DOB: {
      type: Date,
    },
    education: {
      type: String,
    },
    college: {
      type: String,
    },
    domain: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically, same as Sequelize
  },
);

const Student = mongoose.model("Student", studentSchema);

export { Student };
