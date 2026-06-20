import { getAdminDashboard } from "./adminDashboardApi";
import {
  getCourseEnrollmentCountByStudent,
  getCourseEnrollments,
  hasCourseEnrollment,
} from "./courseEnrollmentsApi";
import { getCourseById, getCourses } from "./coursesApi";
import { getInternships } from "./internshipsApi";
import { getJobs } from "./jobsApi";
import { getPlacedStudents } from "./placedStudentsApi";
import { getStudents } from "./studentsApi";
import { getStudentAppliedCounts } from "../utils/studentActivity";

export const fetchStudentsQuery = async () => {
  const students = await getStudents();
  return Array.isArray(students) ? students : [];
};

export const fetchJobsQuery = async () => {
  const jobs = await getJobs();
  return Array.isArray(jobs) ? jobs : [];
};

export const fetchInternshipsQuery = async () => {
  const internships = await getInternships();
  return Array.isArray(internships) ? internships : [];
};

export const fetchCoursesQuery = async (params = {}) => {
  const response = await getCourses(params);
  return Array.isArray(response?.data) ? response.data : [];
};

export const fetchAdminDashboardQuery = async () => {
  return await getAdminDashboard();
};

export const fetchStudentDashboardStatsQuery = async (studentId) => {
  if (!studentId) {
    return { enrolledCourses: 0, jobsApplied: 0, internshipsApplied: 0 };
  }

  let enrolledCourses = 0;
  try {
    enrolledCourses = await getCourseEnrollmentCountByStudent(studentId);
  } catch {
    enrolledCourses = 0;
  }

  const appliedCounts = getStudentAppliedCounts(studentId);
  return {
    enrolledCourses,
    jobsApplied: appliedCounts.jobsApplied,
    internshipsApplied: appliedCounts.internshipsApplied,
  };
};

export const fetchAdminInsightsQuery = async () => {
  const [
    coursesResponse,
    enrollments,
    internships,
    jobs,
    placedStudents,
    students,
  ] = await Promise.all([
    getCourses(),
    getCourseEnrollments(),
    getInternships(),
    getJobs(),
    getPlacedStudents(),
    getStudents(),
  ]);

  return {
    courses: coursesResponse?.data || [],
    enrollments: Array.isArray(enrollments) ? enrollments : [],
    internships: Array.isArray(internships) ? internships : [],
    jobs: Array.isArray(jobs) ? jobs : [],
    placedStudents: Array.isArray(placedStudents) ? placedStudents : [],
    students: Array.isArray(students) ? students : [],
  };
};

export const fetchCourseDetailsQuery = async (courseId) => {
  const response = await getCourseById(courseId);
  return response?.data || null;
};

export const fetchCourseEnrollmentStatusQuery = async ({
  studentId,
  courseId,
}) => {
  if (!studentId || !courseId) {
    return false;
  }

  return await hasCourseEnrollment({ studentId, courseId });
};
