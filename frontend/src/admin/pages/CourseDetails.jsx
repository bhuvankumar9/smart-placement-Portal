import { memo, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Users } from "lucide-react";
import {
  getCourseById,
  getCoursesUpdatedEventName,
} from "../../api/coursesApi";
import { getCourseEnrollments } from "../../api/courseEnrollmentsApi";
import {
  getStudents,
  getStudentsUpdatedEventName,
} from "../../api/studentsApi";

function formatDate(value) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-GB");
}

function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      setLoading(true);

      try {
        const [courseResponse, enrollments, students] = await Promise.all([
          getCourseById(id),
          getCourseEnrollments(),
          getStudents(),
        ]);

        if (!isMounted) return;

        const courseData = courseResponse?.data || null;
        const studentList = Array.isArray(students) ? students : [];
        const enrollmentList = Array.isArray(enrollments) ? enrollments : [];

        const studentsById = new Map(
          studentList.map((student) => [Number(student.id), student]),
        );

        const enrolledRows = enrollmentList
          .filter((enrollment) => Number(enrollment.courseId) === Number(id))
          .map((enrollment) => {
            const student = studentsById.get(Number(enrollment.studentId));

            return {
              enrollmentId: enrollment.id,
              studentId: enrollment.studentId,
              status: enrollment.status || "active",
              enrolledAt: enrollment.enrolledAt,
              name: student?.name || "-",
              email: student?.email || "-",
              phone: student?.phone || "-",
              domain: student?.domain || "-",
              education: student?.education || "-",
            };
          });

        setCourse(courseData);
        setEnrolledStudents(enrolledRows);
        setError("");
      } catch {
        if (!isMounted) return;

        setCourse(null);
        setEnrolledStudents([]);
        setError("Unable to load course details.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    const coursesUpdatedEvent = getCoursesUpdatedEventName();
    const studentsUpdatedEvent = getStudentsUpdatedEventName();

    window.addEventListener("storage", loadDetails);
    window.addEventListener(coursesUpdatedEvent, loadDetails);
    window.addEventListener(studentsUpdatedEvent, loadDetails);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", loadDetails);
      window.removeEventListener(coursesUpdatedEvent, loadDetails);
      window.removeEventListener(studentsUpdatedEvent, loadDetails);
    };
  }, [id]);

  const summary = useMemo(
    () => ({
      enrolledCount: enrolledStudents.length,
      activeCount: enrolledStudents.filter(
        (student) => String(student.status).toLowerCase() === "active",
      ).length,
    }),
    [enrolledStudents],
  );

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 text-sm text-gray-500">
        Loading course details...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Link>
        <div className="bg-white border border-red-100 rounded-xl p-6 text-sm text-red-600">
          {error || "Course not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/courses"
        className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
      >
        <ArrowLeft size={16} />
        Back to Courses
      </Link>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {course.title || "Course"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Instructor: {course.instructor || "-"}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              course.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {course.status || "-"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Duration
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {course.duration || "-"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Category
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {course.domain || course.branch || "-"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Enrolled
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {summary.enrolledCount}
              </p>
            </div>
            <BookOpen className="text-red-600" size={18} />
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Active Enrollments
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {summary.activeCount}
              </p>
            </div>
            <Users className="text-red-600" size={18} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">Course Overview</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {course.overview || "No overview available."}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Enrolled Students</h2>
          <span className="text-sm text-gray-500">
            {summary.enrolledCount} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead className="bg-red-100/60 text-gray-700 text-sm">
              <tr>
                <th className="text-left p-4">Student ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Domain</th>
                <th className="text-left p-4">Education</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Enrolled On</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {enrolledStudents.map((student) => (
                <tr key={student.enrollmentId} className="hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">
                    <Link
                      to={`/admin/students/${student.studentId}`}
                      className="text-red-600 hover:text-red-700 hover:underline"
                    >
                      NITS{String(student.studentId || "").padStart(3, "0")}
                    </Link>
                  </td>
                  <td className="p-4">{student.name}</td>
                  <td className="p-4">{student.phone}</td>
                  <td className="p-4">{student.domain}</td>
                  <td className="p-4">{student.education}</td>
                  <td className="p-4 capitalize">{student.status}</td>
                  <td className="p-4">{formatDate(student.enrolledAt)}</td>
                </tr>
              ))}

              {enrolledStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No students enrolled in this course yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default memo(CourseDetails);
