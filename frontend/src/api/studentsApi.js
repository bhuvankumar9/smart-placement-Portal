import client from "./client.js";

const emitStudentsUpdated = () => {
  window.dispatchEvent(new Event(getStudentsUpdatedEventName()));
};

export const getStudents = async () => {
  try {
    const response = await client.get("/students");
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching students", error);
    return [];
  }
};

export const getStudentById = async (id) => {
  try {
    const response = await client.get(`/students/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching student by id", error);
    return null;
  }
};

export const addStudent = async (studentInput) => {
  await client.post("/students", studentInput);
  emitStudentsUpdated();
  return await getStudents();
};

export const updateStudent = async (id, studentInput) => {
  await client.put(`/students/${id}`, studentInput);
  emitStudentsUpdated();
  return await getStudents();
};

export const updateStudentProfileById = async (id, studentInput) => {
  const response = await client.put(`/students/${id}`, studentInput);
  emitStudentsUpdated();
  return response.data?.data || response.data;
};

export const deleteStudent = async (id) => {
  await client.delete(`/students/${id}`);
  emitStudentsUpdated();
  return await getStudents();
};

export const getStudentsUpdatedEventName = () => "students-updated";
