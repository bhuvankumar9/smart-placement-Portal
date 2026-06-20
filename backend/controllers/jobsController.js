import { Job } from "../models/jobsModel.js";

const createJob = async (req, res) => {
  const {
    position,
    company,
    logo,
    location,
    salary,
    jobURL,
    description,
    requirements,
  } = req.body;

  if (!position || !company || !location) {
    return res.status(400).json({
      success: false,
      message: "position, company and location are required",
    });
  }

  try {
    const job = await Job.create({
      position,
      company,
      logo,
      location,
      salary,
      jobURL,
      description,
      requirements,
    });

    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({ success: true, data: updatedJob });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { createJob, getAllJobs, getJobById, updateJob, deleteJob };
