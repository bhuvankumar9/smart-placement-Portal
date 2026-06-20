const STUDENT_AUTH_KEY = "student_auth";
const JOB_APPLICATIONS_KEY = "student_job_applications";
const INTERNSHIP_APPLICATIONS_KEY = "student_internship_applications";

const parseJSON = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readMap = (storageKey) => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return {};

  const parsed = parseJSON(raw, {});
  return parsed && typeof parsed === "object" ? parsed : {};
};

const writeMap = (storageKey, value) => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

export const getStoredStudent = () => {
  const raw = localStorage.getItem(STUDENT_AUTH_KEY);
  if (!raw) return null;

  const parsed = parseJSON(raw, null);
  if (!parsed || !parsed.id) return null;

  return parsed;
};

export const getStoredStudentId = () => {
  const student = getStoredStudent();
  return student?.id || null;
};

const getAppliedIds = (storageKey, studentId) => {
  if (!studentId) return [];

  const allApplications = readMap(storageKey);
  const ids = allApplications[String(studentId)];

  return Array.isArray(ids) ? ids.map((id) => String(id)) : [];
};

const setAppliedIds = (storageKey, studentId, ids) => {
  const allApplications = readMap(storageKey);
  allApplications[String(studentId)] = ids.map((id) => String(id));
  writeMap(storageKey, allApplications);
};

const addAppliedId = (storageKey, studentId, itemId) => {
  if (!studentId || !itemId) return false;

  const normalizedItemId = String(itemId);
  const currentIds = getAppliedIds(storageKey, studentId);

  if (currentIds.includes(normalizedItemId)) {
    return false;
  }

  setAppliedIds(storageKey, studentId, [...currentIds, normalizedItemId]);
  return true;
};

export const getAppliedJobIds = (studentId) => {
  return getAppliedIds(JOB_APPLICATIONS_KEY, studentId);
};

export const hasAppliedToJob = (studentId, jobId) => {
  return getAppliedJobIds(studentId).includes(String(jobId));
};

export const addJobApplication = (studentId, jobId) => {
  return addAppliedId(JOB_APPLICATIONS_KEY, studentId, jobId);
};

export const getAppliedInternshipIds = (studentId) => {
  return getAppliedIds(INTERNSHIP_APPLICATIONS_KEY, studentId);
};

export const hasAppliedToInternship = (studentId, internshipId) => {
  return getAppliedInternshipIds(studentId).includes(String(internshipId));
};

export const addInternshipApplication = (studentId, internshipId) => {
  return addAppliedId(INTERNSHIP_APPLICATIONS_KEY, studentId, internshipId);
};

export const getStudentAppliedCounts = (studentId) => {
  return {
    jobsApplied: getAppliedJobIds(studentId).length,
    internshipsApplied: getAppliedInternshipIds(studentId).length,
  };
};
