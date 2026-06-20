import client from "./client.js";

const toList = (response) => {
  const payload = response?.data?.data || response?.data;
  return Array.isArray(payload) ? payload : [];
};

export const createCourseEnrollment = async ({
  studentId,
  courseId,
  status = "active",
}) => {
  const payload = {
    courseId,
    status,
  };

  if (studentId !== undefined && studentId !== null) {
    payload.studentId = studentId;
  }

  const response = await client.post("/course-enrollments", payload);

  return response.data?.data || response.data;
};

export const hasCourseEnrollment = async ({ studentId, courseId }) => {
  const response = await client.get("/course-enrollments");
  const enrollments = toList(response);

  // MongoDB _id values are strings (e.g. "65f1a2b3c4d5e6f7a8b9c0d1"), not
  // integers, so we compare as strings instead of using Number(...).
  return enrollments.some(
    (enrollment) =>
      String(enrollment.studentId) === String(studentId) &&
      String(enrollment.courseId) === String(courseId),
  );
};

export const getCourseEnrollments = async () => {
  try {
    const response = await client.get("/course-enrollments");
    return toList(response);
  } catch (error) {
    console.error("Error fetching course enrollments", error);
    return [];
  }
};

export const getCourseEnrollmentsByStudent = async (studentId) => {
  const enrollments = await getCourseEnrollments();

  return enrollments.filter(
    (enrollment) => String(enrollment.studentId) === String(studentId),
  );
};

export const getCourseEnrollmentCountByStudent = async (studentId) => {
  if (!studentId) return 0;

  const response = await client.get("/course-enrollments");
  const enrollments = toList(response);

  return enrollments.filter(
    (enrollment) => String(enrollment.studentId) === String(studentId),
  ).length;
};
