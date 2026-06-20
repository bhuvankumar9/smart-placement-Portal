import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { getCoursesUpdatedEventName } from "../api/coursesApi";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import { fetchCoursesQuery } from "../api/queryFns";
import { queryKeys } from "../api/queryKeys";

const CourseCard = ({ course }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <img
      src={course.imageUrl}
      alt={course.title}
      className="h-40 w-full object-cover"
    />
    <div className="p-5">
      <h3 className="font-bold text-slate-800 text-lg">{course.title}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {course.instructor}{" "}
        {course.instructorRole ? `• ${course.instructorRole}` : ""}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center text-gray-400 text-sm">
          <Clock size={16} className="mr-1" />
          <span>{course.hours || course.duration}</span>
        </div>
        <Link
          to={`/courses/${course.id}`}
          className="text-red-600 font-bold text-sm hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
);

const Courses = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { toast, showToast } = useToast();
  const navbarSearch = (searchParams.get("q") || "").trim().toLowerCase();

  const {
    data: courseList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.courses(),
    queryFn: () => fetchCoursesQuery(),
  });

  const coursesError = error?.message || null;

  const loading = isLoading;

  const activeCourses = useMemo(
    () =>
      courseList.filter(
        (course) => String(course.status).toLowerCase() === "active",
      ),
    [courseList],
  );

  const filteredCourses = useMemo(() => {
    if (!navbarSearch) {
      return activeCourses;
    }

    return activeCourses.filter((course) =>
      [
        course.title,
        course.instructor,
        course.instructorRole,
        course.level,
        course.duration,
        course.hours,
        course.overview,
        ...(Array.isArray(course.whatYouLearn) ? course.whatYouLearn : []),
        ...(Array.isArray(course.includes) ? course.includes : []),
      ].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(navbarSearch),
      ),
    );
  }, [activeCourses, navbarSearch]);

  // Invalidate cache when admin updates courses (same or cross tab)
  useEffect(() => {
    const coursesUpdatedEvent = getCoursesUpdatedEventName();

    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      showToast("Course list updated.", "success", 2000);
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(coursesUpdatedEvent, handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(coursesUpdatedEvent, handleSync);
    };
  }, [queryClient, showToast]);

  return (
    <div>
      <Toast toast={toast} position="inline" />

      <h1 className="text-3xl font-bold text-slate-900">Explore Courses</h1>
      <p className="text-gray-500 mt-2 mb-8">
        Master new skills and prepare yourself for the upcoming placement
        season.
      </p>

      {loading && <p className="text-sm text-gray-500">Loading courses...</p>}
      {coursesError && <p className="text-sm text-red-600">{coursesError}</p>}

      {!loading && !coursesError && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <div className="col-span-full bg-white border border-gray-200 rounded-xl p-6 text-gray-500">
              {activeCourses.length > 0
                ? "No courses match your search."
                : "No active courses available right now."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;
