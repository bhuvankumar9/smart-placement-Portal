import { Internship } from "../models/internshipModel.js";

const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find();
    res.status(200).json({
      success: true,
      data: internships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }
    res.status(200).json({
      success: true,
      data: internship,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createInternship = async (req, res) => {
  try {
    const internship = await Internship.create(req.body);
    res.status(201).json({
      success: true,
      data: internship,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    res.status(200).json({
      success: true,
      data: internship,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const deleted = await Internship.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Internship deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
};
