import client from "./client.js";

const emitCoursesUpdated = () => {
  window.dispatchEvent(new Event(getCoursesUpdatedEventName()));
};

const parseList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Ignore JSON parse errors and fall back to text splitting.
    }

    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeCourse = (course) => ({
  ...course,
  id: String(course.id || course._id || ""),
  imageUrl: course.imageUrl || course.img || "",
  status: course.status || "Active",
  hours: course.hours || course.duration,
  whatYouLearn: course.whatYouLearn || parseList(course.what_you_will_learn),
  includes: course.includes || parseList(course.course_features),
});

const toBackendPayload = (payload) => ({
  title: payload.title,
  level: payload.level,
  instructor: payload.instructor,
  status: payload.status || "Active",
  img: payload.imageUrl || payload.img || "",
  duration: Number(payload.duration) || 0,
  branch: payload.branch || payload.domain || "General",
  overview: payload.overview || "",
  what_you_will_learn: Array.isArray(payload.whatYouLearn)
    ? payload.whatYouLearn.join(", ")
    : payload.what_you_will_learn || "",
  course_features: Array.isArray(payload.includes)
    ? payload.includes.join(", ")
    : payload.course_features || "",
});

export const getCourses = async (params = {}) => {
  const response = await client.get("/courses", { params });
  let courses = response.data.data || response.data;
  courses = Array.isArray(courses) ? courses.map(normalizeCourse) : [];

  if (params.search || params.duration || params.status) {
    const search = String(params.search || "")
      .toLowerCase()
      .trim();
    const duration = String(params.duration || "")
      .toLowerCase()
      .trim();
    const status = String(params.status || "")
      .toLowerCase()
      .trim();

    courses = courses.filter((course) => {
      const searchMatch =
        !search ||
        [course.title, course.instructor, course.instructorRole]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(search));

      const durationMatch =
        !duration ||
        String(course.duration || "")
          .toLowerCase()
          .includes(duration);
      const statusMatch =
        !status || String(course.status || "").toLowerCase() === status;

      return searchMatch && durationMatch && statusMatch;
    });
  }

  return { data: courses };
};

export const getCourseById = async (id) => {
  const response = await client.get(`/courses/${id}`);
  const course = response.data.data || response.data;
  return { data: normalizeCourse(course) };
};

export const createCourse = async (payload) => {
  const response = await client.post("/courses", toBackendPayload(payload));
  emitCoursesUpdated();
  const course = response.data.data || response.data;
  return { data: normalizeCourse(course) };
};

export const updateCourse = async (id, payload) => {
  const response = await client.put(
    `/courses/${id}`,
    toBackendPayload(payload),
  );
  emitCoursesUpdated();
  const course = response.data.data || response.data;
  return { data: normalizeCourse(course) };
};

export const deleteCourse = async (id) => {
  const response = await client.delete(`/courses/${id}`);
  emitCoursesUpdated();
  return { data: response.data.data || response.data };
};

export const getCoursesUpdatedEventName = () => "courses-updated";
