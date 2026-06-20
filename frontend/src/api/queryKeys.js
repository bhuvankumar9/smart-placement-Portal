export const queryKeys = {
  students: ["students"],
  jobs: ["jobs"],
  internships: ["internships"],
  courses: (params = {}) => ["courses", params],
  adminDashboard: ["adminDashboard"],
  adminInsights: ["adminInsights"],
  studentDashboard: (studentId) => ["studentDashboard", String(studentId || "")],
  courseDetails: (courseId) => ["courseDetails", String(courseId || "")],
  courseEnrollmentStatus: (studentId, courseId) => [
    "courseEnrollmentStatus",
    String(studentId || ""),
    String(courseId || ""),
  ],
};
