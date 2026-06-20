import mongoose from "mongoose";
import { Student } from "../models/studentsModel.js";
import { Course } from "../models/courseModel.js";
import { Internship } from "../models/internshipModel.js";
import { PlacedStudent } from "../models/placedStudentModel.js";

const getAdminDashboard = async (_req, res) => {
  try {
    const [
      totalStudents,
      activeCourses,
      totalInternships,
      totalPlacements,
      recentStudents,
    ] = await Promise.all([
      Student.countDocuments(),
      Course.countDocuments({ status: "Active" }),
      Internship.countDocuments(),
      PlacedStudent.countDocuments(),

      // $lookup is Mongo's equivalent of SQL's LEFT JOIN.
      // It joins each student to any matching rows in the placedstudents
      // collection, then we use $addFields + $cond to replicate the
      // CASE WHEN COUNT(ps.id) > 0 THEN 'Placed' ELSE 'Active' END logic.
      Student.aggregate([
        {
          $lookup: {
            from: "placedstudents", // actual MongoDB collection name
            localField: "_id",
            foreignField: "studentId",
            as: "placements",
          },
        },
        {
          $addFields: {
            placementStatus: {
              $cond: [
                { $gt: [{ $size: "$placements" }, 0] },
                "Placed",
                "Active",
              ],
            },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            domain: 1,
            education: 1,
            college: 1,
            createdAt: 1,
            placementStatus: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          activeCourses,
          internships: totalInternships,
          placements: totalPlacements,
        },
        recentStudents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAdminDashboard,
};
