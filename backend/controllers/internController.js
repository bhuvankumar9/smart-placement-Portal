import { Intern } from "../models/internModel.js";

const getAllInterns = async (req, res) => {
  try {
    const interns = await Intern.find();
    res.status(200).json(interns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInternById = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ message: "Intern not found" });
    res.status(200).json(intern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createIntern = async (req, res) => {
  const {
    category,
    stipend,
    start_date,
    end_date,
    status,
    internshipId,
    studentId,
  } = req.body;

  if (
    !category ||
    !start_date ||
    !end_date ||
    !status ||
    !internshipId ||
    !studentId
  ) {
    return res.status(400).json({
      message:
        "category, start_date, end_date, status, internshipId and studentId are required",
    });
  }

  try {
    const existingIntern = await Intern.findOne({
      internshipId,
      studentId,
    });

    if (existingIntern) {
      return res.status(409).json({
        message: "Student already applied for this internship",
      });
    }

    const newIntern = await Intern.create({
      category,
      stipend: stipend ?? null,
      start_date,
      end_date,
      status,
      internshipId,
      studentId,
    });
    res.status(201).json(newIntern);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateIntern = async (req, res) => {
  try {
    const intern = await Intern.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    res.status(200).json(intern);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteIntern = async (req, res) => {
  try {
    const deleted = await Intern.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Intern not found" });
    }
    res.status(200).json({ message: "Intern deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllInterns,
  getInternById,
  createIntern,
  updateIntern,
  deleteIntern,
};
