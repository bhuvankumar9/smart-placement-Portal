import { PlacedStudent } from "../models/placedStudentModel.js";

const getAllPlacedStudents = async (req, res) => {
  try {
    const placedStudents = await PlacedStudent.find();
    res.status(200).json({ success: true, data: placedStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPlacedStudentById = async (req, res) => {
  try {
    const placedStudent = await PlacedStudent.findById(req.params.id);
    if (!placedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Placed student not found" });
    }
    res.status(200).json({ success: true, data: placedStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPlacedStudent = async (req, res) => {
  try {
    const placedStudent = await PlacedStudent.create(req.body);
    res.status(201).json({ success: true, data: placedStudent });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePlacedStudent = async (req, res) => {
  try {
    const placedStudent = await PlacedStudent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!placedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Placed student not found" });
    }

    res.status(200).json({ success: true, data: placedStudent });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deletePlacedStudent = async (req, res) => {
  try {
    const deleted = await PlacedStudent.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Placed student not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Placed student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAllPlacedStudents,
  getPlacedStudentById,
  createPlacedStudent,
  updatePlacedStudent,
  deletePlacedStudent,
};
