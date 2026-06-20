import { memo, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  createCourse,
  deleteCourse,
  getCoursesUpdatedEventName,
  updateCourse,
} from "../../api/coursesApi";
import { fetchCoursesQuery } from "../../api/queryFns";
import { queryKeys } from "../../api/queryKeys";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import { AnimatePresence, motion } from "framer-motion";
import {
  modalBackdropVariants,
  modalPanelVariants,
} from "../../utils/modalMotion";

const emptyForm = {
  title: "",
  instructor: "",
  level: "Beginner",
  category: "Paid",
  status: "Active",
  duration: "",
  fees: "",
  imageUrl: "",
  overview: "",
  whatYouLearnText: "",
  includesText: "",
};

const toPayload = (form) => ({
  title: form.title,
  instructor: form.instructor,
  instructorRole: "",
  level: form.level,
  domain: form.category,
  duration: form.duration,
  hours: "",
  fees: Number(form.fees) || 0,
  students: 0,
  status: form.status || "Active",
  imageUrl: form.imageUrl,
  overview: form.overview,
  whatYouLearn: form.whatYouLearnText
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean),
  includes: form.includesText
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean),
});

const toFormState = (course) => ({
  title: course.title || "",
  instructor: course.instructor || "",
  level: course.level || "Beginner",
  category: course.domain || course.branch || "Paid",
  status: course.status || "Active",
  duration: course.duration || "",
  fees: course.fees ?? "",
  imageUrl: course.imageUrl || "",
  overview: course.overview || "",
  whatYouLearnText: (course.whatYouLearn || []).join("\n"),
  includesText: (course.includes || []).join("\n"),
});

function Courses() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [queryParams, setQueryParams] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formState, setFormState] = useState(emptyForm);
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast } = useToast();
  const navbarSearch = searchParams.get("q") || "";

  const buildFilterParams = (overrides = {}) => {
    const nextSearch = overrides.search ?? searchTerm;
    const nextDuration = overrides.duration ?? durationFilter;
    const nextStatus = overrides.status ?? statusFilter;

    return {
      search: nextSearch || undefined,
      duration: nextDuration || undefined,
      status: nextStatus || undefined,
    };
  };

  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.courses(queryParams),
    queryFn: () => fetchCoursesQuery(queryParams),
  });

  const loading = isLoading;

  useEffect(() => {
    const syncCourses = () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    };

    const coursesUpdatedEvent = getCoursesUpdatedEventName();

    window.addEventListener("storage", syncCourses);
    window.addEventListener(coursesUpdatedEvent, syncCourses);

    return () => {
      window.removeEventListener("storage", syncCourses);
      window.removeEventListener(coursesUpdatedEvent, syncCourses);
    };
  }, [queryClient]);

  useEffect(() => {
    setSearchTerm(navbarSearch);
    setQueryParams(buildFilterParams({ search: navbarSearch }));
  }, [navbarSearch]);

  const durationOptions = useMemo(() => {
    const uniqueDurations = [
      ...new Set(courses.map((course) => course.duration).filter(Boolean)),
    ];
    return uniqueDurations;
  }, [courses]);

  const onApplyFilter = () => {
    setQueryParams(buildFilterParams());
  };

  const onOpenAddModal = () => {
    setEditingId(null);
    setFormState(emptyForm);
    setSubmitError("");
    setIsModalOpen(true);
  };

  const onOpenEditModal = (course) => {
    setEditingId(course.id);
    setFormState(toFormState(course));
    setSubmitError("");
    setIsModalOpen(true);
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormState(emptyForm);
    setSubmitError("");
  };

  const onOpenDeleteModal = (course) => {
    setDeleteTarget({ id: course.id, title: course.title || "this course" });
  };

  const onCloseDeleteModal = () => {
    setDeleteTarget(null);
  };

  const onChangeField = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitForm = async (event) => {
    event.preventDefault();

    if (!formState.title.trim()) {
      setSubmitError("Course title is required.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = toPayload(formState);

      if (editingId) {
        await updateCourse(editingId, payload);
        showToast("Course updated successfully.");
      } else {
        await createCourse(payload);
        showToast("Course added successfully.");
      }

      onCloseModal();
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    } catch (saveError) {
      console.error(saveError);
      setSubmitError("Unable to save course. Please try again.");
      showToast("Unable to save course.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      await deleteCourse(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      showToast("Course deleted successfully.");
      onCloseDeleteModal();
    } catch (deleteError) {
      console.error(deleteError);
      showToast("Unable to delete course.", "error");
    }
  };

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses</h1>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onOpenAddModal}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-none text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          + Add Courses
        </motion.button>
      </div>

      <div className="bg-white p-5 rounded-none shadow-sm border border-gray-100 flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search Course"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-60 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
        />

        <select
          value={durationFilter}
          onChange={(event) => setDurationFilter(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
        >
          <option value="">Duration</option>
          {durationOptions.map((duration) => (
            <option key={duration} value={duration}>
              {duration}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
        >
          <option value="">Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onApplyFilter}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-none text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          Apply Filter
        </motion.button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold p-5">Course List</h2>

        {loading && (
          <p className="px-5 pb-4 text-sm text-gray-500">Loading courses...</p>
        )}
        {!loading && error && (
          <p className="px-5 pb-4 text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <div className="responsive-table-wrap">
            <table className="w-full min-w-[860px] table-fixed">
              <thead className="bg-red-100 text-gray-700 text-sm">
                <tr>
                  <th className="text-center p-4 whitespace-nowrap w-[34%]">
                    Course Name
                  </th>
                  <th className="text-center p-4 whitespace-nowrap w-[11%]">
                    Duration
                  </th>
                  <th className="text-center p-4 whitespace-nowrap w-[11%]">
                    Fees
                  </th>
                  <th className="text-center p-4 whitespace-nowrap w-[11%]">
                    Students
                  </th>
                  <th className="text-center p-4 whitespace-nowrap w-[11%]">
                    Status
                  </th>
                  <th className="text-center p-4 whitespace-nowrap w-[22%]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="text-gray-600">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <tr key={course.id} className="border-t">
                      <td className="p-4 text-sm font-medium text-gray-900 text-center">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="text-red-600 hover:text-red-700 hover:underline"
                        >
                          {course.title}
                        </Link>
                      </td>
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap text-center">
                        {course.duration || "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap text-center">
                        Rs {Number(course.fees || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap text-center">
                        {course.students || 0}
                      </td>
                      <td
                        className={`p-4 text-sm font-semibold whitespace-nowrap text-center ${course.status === "Active" ? "text-green-600" : "text-gray-500"}`}
                      >
                        {course.status}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => onOpenEditModal(course)}
                            className="inline-flex items-center px-3 py-1.5 rounded-sm border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => onOpenDeleteModal(course)}
                            className="inline-flex items-center px-3 py-1.5 rounded-sm border border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white font-semibold transition-colors cursor-pointer"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-6 text-center text-sm text-gray-500"
                    >
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              variants={modalBackdropVariants}
            />
            <motion.div
              variants={modalPanelVariants}
              className="relative z-50 bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Course" : "Add Course"}
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onCloseModal}
                  className="text-gray-500 hover:text-gray-700 rounded-sm cursor-pointer"
                >
                  Close
                </motion.button>
              </div>

              <form
                onSubmit={onSubmitForm}
                className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="course-title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Course Title
                  </label>
                  <input
                    id="course-title"
                    name="title"
                    value={formState.title}
                    onChange={onChangeField}
                    placeholder="Course title"
                    className="border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="course-instructor"
                    className="text-sm font-medium text-gray-700"
                  >
                    Instructor Name
                  </label>
                  <input
                    id="course-instructor"
                    name="instructor"
                    value={formState.instructor}
                    onChange={onChangeField}
                    placeholder="Instructor name"
                    className="border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="course-level"
                    className="text-sm font-medium text-gray-700"
                  >
                    Level
                  </label>
                  <input
                    id="course-level"
                    name="level"
                    value={formState.level}
                    onChange={onChangeField}
                    placeholder="Level"
                    className="border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="course-category"
                    className="text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="course-category"
                    name="category"
                    value={formState.category}
                    onChange={onChangeField}
                    className="border border-gray-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="course-status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="course-status"
                    name="status"
                    value={formState.status}
                    onChange={onChangeField}
                    className="border border-gray-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="course-duration"
                    className="text-sm font-medium text-gray-700"
                  >
                    Duration
                  </label>
                  <input
                    id="course-duration"
                    name="duration"
                    value={formState.duration}
                    onChange={onChangeField}
                    placeholder="Duration (example: 12 Weeks)"
                    className="border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="course-fees"
                    className="text-sm font-medium text-gray-700"
                  >
                    Fees
                  </label>
                  <input
                    id="course-fees"
                    name="fees"
                    value={formState.fees}
                    onChange={onChangeField}
                    placeholder="Fees"
                    className="border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="course-image-url"
                    className="text-sm font-medium text-gray-700"
                  >
                    Image URL
                  </label>
                  <input
                    id="course-image-url"
                    name="imageUrl"
                    value={formState.imageUrl}
                    onChange={onChangeField}
                    placeholder="Image URL"
                    className="border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1">
                  <label
                    htmlFor="course-overview"
                    className="text-sm font-medium text-gray-700"
                  >
                    Course Overview
                  </label>
                  <textarea
                    id="course-overview"
                    name="overview"
                    value={formState.overview}
                    onChange={onChangeField}
                    placeholder="Course overview"
                    className="border border-gray-300 px-3 py-2 text-sm min-h-24"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1">
                  <label
                    htmlFor="course-what-you-learn"
                    className="text-sm font-medium text-gray-700"
                  >
                    What You Will Learn
                  </label>
                  <textarea
                    id="course-what-you-learn"
                    name="whatYouLearnText"
                    value={formState.whatYouLearnText}
                    onChange={onChangeField}
                    placeholder="What you will learn (comma or new line separated)"
                    className="border border-gray-300 px-3 py-2 text-sm min-h-20"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1">
                  <label
                    htmlFor="course-includes"
                    className="text-sm font-medium text-gray-700"
                  >
                    This Course Includes
                  </label>
                  <textarea
                    id="course-includes"
                    name="includesText"
                    value={formState.includesText}
                    onChange={onChangeField}
                    placeholder="This course includes (comma or new line separated)"
                    className="border border-gray-300 px-3 py-2 text-sm min-h-20"
                  />
                </div>

                {submitError && (
                  <p className="md:col-span-2 text-sm text-red-600">
                    {submitError}
                  </p>
                )}

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={onCloseModal}
                    className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-sm cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 rounded-sm cursor-pointer"
                  >
                    {isSaving
                      ? "Saving..."
                      : editingId
                        ? "Update Course"
                        : "Create Course"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              variants={modalBackdropVariants}
              onClick={onCloseDeleteModal}
            />
            <motion.div
              variants={modalPanelVariants}
              className="relative z-50 bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Course
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Are you sure you want to delete
                  <span className="font-semibold text-gray-900">
                    {` ${deleteTarget.title}`}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="p-5 flex items-center justify-end gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onCloseDeleteModal}
                  className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-sm cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onDelete}
                  className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-sm cursor-pointer"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(Courses);
