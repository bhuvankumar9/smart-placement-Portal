import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  CheckCircle,
  FileText,
  Infinity,
  PlayCircle,
  Smartphone,
} from "lucide-react";
import { getCoursesUpdatedEventName } from "../api/coursesApi";
import { createCourseEnrollment } from "../api/courseEnrollmentsApi";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import { motion } from "framer-motion";
import {
  hydrateCurrentUser,
  selectAuthStatus,
  selectIsStudent,
  selectStudentId,
} from "../store/slices/authSlice";
import {
  fetchCourseDetailsQuery,
  fetchCourseEnrollmentStatusQuery,
} from "../api/queryFns";
import { queryKeys } from "../api/queryKeys";

const includeIconByText = (text) => {
  const lowerText = String(text).toLowerCase();

  if (lowerText.includes("video")) return <PlayCircle size={20} />;
  if (lowerText.includes("resource")) return <FileText size={20} />;
  if (lowerText.includes("lifetime")) return <Infinity size={20} />;
  if (lowerText.includes("mobile") || lowerText.includes("laptop"))
    return <Smartphone size={20} />;

  return <Award size={20} />;
};

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const authStatus = useSelector(selectAuthStatus);
  const studentId = useSelector(selectStudentId);
  const isStudent = useSelector(selectIsStudent);

  const [enrolling, setEnrolling] = useState(false);
  const { toast, showToast } = useToast();

  const {
    data: course,
    isLoading: loading,
    error: courseError,
  } = useQuery({
    queryKey: queryKeys.courseDetails(id),
    queryFn: () => fetchCourseDetailsQuery(id),
    enabled: Boolean(id),
  });

  const { data: enrolled = false } = useQuery({
    queryKey: queryKeys.courseEnrollmentStatus(studentId, id),
    queryFn: () =>
      fetchCourseEnrollmentStatusQuery({
        studentId,
        courseId: id,
      }),
    enabled: Boolean(isStudent && studentId && id),
  });

  const error = courseError ? "Course details could not be loaded." : "";

  useEffect(() => {
    if (authStatus === "idle") {
      dispatch(hydrateCurrentUser());
    }
  }, [authStatus, dispatch]);

  useEffect(() => {
    const syncCourse = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courseDetails(id) });
      if (studentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.courseEnrollmentStatus(studentId, id),
        });
      }
    };
    const coursesUpdatedEvent = getCoursesUpdatedEventName();

    window.addEventListener("storage", syncCourse);
    window.addEventListener(coursesUpdatedEvent, syncCourse);

    return () => {
      window.removeEventListener("storage", syncCourse);
      window.removeEventListener(coursesUpdatedEvent, syncCourse);
    };
  }, [id, studentId, queryClient]);

  const learnList = useMemo(() => course?.whatYouLearn || [], [course]);
  const includeList = useMemo(() => course?.includes || [], [course]);
  const isCourseActive =
    String(course?.status || "active").toLowerCase() === "active";

  const handleEnroll = async () => {
    if (enrolling || enrolled) {
      return;
    }

    if (!isCourseActive) {
      showToast("This course is currently inactive.", "error");
      return;
    }

    setEnrolling(true);

    try {
      if (!isStudent || !studentId) {
        showToast(
          "Please login as a student to enroll in this course.",
          "error",
        );
        navigate("/login");
        return;
      }

      await createCourseEnrollment({
        studentId,
        courseId: String(id),
      });

      queryClient.setQueryData(
        queryKeys.courseEnrollmentStatus(studentId, id),
        true,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentDashboard(studentId),
      });
      showToast("Enrolled successfully.", "success");
    } catch (enrollError) {
      const message = String(
        enrollError?.response?.data?.message || "",
      ).toLowerCase();

      if (message.includes("already") && message.includes("enroll")) {
        queryClient.setQueryData(
          queryKeys.courseEnrollmentStatus(studentId, id),
          true,
        );
        queryClient.invalidateQueries({
          queryKey: queryKeys.studentDashboard(studentId),
        });
        showToast("You are already enrolled in this course.", "success");
        return;
      }

      if (enrollError?.response?.status === 401) {
        showToast("Please login to continue.", "error");
        navigate("/login");
        return;
      }

      if (enrollError?.response?.status === 404) {
        showToast("Course or student account not found.", "error");
        return;
      }

      const backendMessage = enrollError?.response?.data?.message;
      showToast(
        backendMessage || "Failed to enroll in this course. Please try again.",
        "error",
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading course details...</p>;
  }

  if (error || !course) {
    return (
      <div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/courses")}
          className="mb-6 text-red-500 cursor-pointer hover:text-red-600 font-medium"
        >
          Back to Courses
        </motion.button>
        <p className="text-red-600">{error || "Course not found."}</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <Toast toast={toast} position="inline" />

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/courses")}
        className="mb-6 text-red-500 cursor-pointer hover:text-red-600 font-medium"
      >
        Back to Courses
      </motion.button>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-8">
        <div className="h-64 bg-slate-900 relative">
          <img
            src={course.imageUrl}
            className="w-full h-full object-cover opacity-40"
            alt={course.title}
          />
        </div>
        <div className="p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between z-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 z-10">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 z-10 text-sm font-medium">
              <span className="text-red-500 flex items-center z-10 gap-1">
                Level: {course.level || "Beginner"}
              </span>
              <span className="text-gray-400 flex items-center gap-1">
                Duration: {course.duration || "-"}
              </span>
              <span className="text-gray-400 z-10">
                Rating: {course.rating || 0} ({course.reviews || 0} Reviews)
              </span>
            </div>
            <p className="text-gray-500 mt-3 z-10">
              {course.instructor}{" "}
              {course.instructorRole ? `- ${course.instructorRole}` : ""}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={handleEnroll}
            disabled={enrolling || enrolled || !isCourseActive}
            className={`rounded-sm px-10 py-3 cursor-pointer z-10 rounded-xl font-bold text-lg  transition-all ${
              enrolled
                ? "bg-emerald-600 text-white cursor-not-allowed shadow-emerald-200"
                : !isCourseActive
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : enrolling
                    ? "bg-red-400 text-white cursor-not-allowed shadow-red-200"
                    : "bg-[#FF0000] text-white hover:bg-red-700 shadow-red-200"
            }`}
          >
            {enrolled
              ? "Enrolled"
              : !isCourseActive
                ? "Inactive"
                : enrolling
                  ? "Enrolling..."
                  : "Enroll Now"}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-2xl border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-slate-800">
              Course Overview
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {course.overview || "Overview not available."}
            </p>

            <h3 className="text-lg font-bold mt-8 mb-4">What you will learn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learnList.length > 0 ? (
                learnList.map((item) => (
                  <div
                    key={item}
                    className="flex items-start space-x-3 text-gray-600"
                  >
                    <CheckCircle
                      size={18}
                      className="text-green-500 mt-1 shrink-0"
                    />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No learning outcomes added yet.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-6 text-slate-800">
            This course includes:
          </h2>
          <ul className="space-y-5">
            {includeList.length > 0 ? (
              includeList.map((item) => (
                <li
                  key={item}
                  className="flex items-center space-x-4 text-gray-500 font-medium"
                >
                  <span className="text-red-500">
                    {includeIconByText(item)}
                  </span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm">
                No feature list available.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
