import client from "./client.js";

const emitPlacedStudentsUpdated = () => {
  window.dispatchEvent(new Event(getPlacedStudentsUpdatedEventName()));
};

export const getPlacedStudents = async () => {
  try {
    const response = await client.get("/placed-students");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching placed students", error);
    return [];
  }
};

export const addPlacedStudent = async (placedStudentInput) => {
  await client.post("/placed-students", placedStudentInput);
  emitPlacedStudentsUpdated();
  return await getPlacedStudents();
};

export const updatePlacedStudent = async (id, placedStudentInput) => {
  await client.put(`/placed-students/${id}`, placedStudentInput);
  emitPlacedStudentsUpdated();
  return await getPlacedStudents();
};

export const deletePlacedStudent = async (id) => {
  await client.delete(`/placed-students/${id}`);
  emitPlacedStudentsUpdated();
  return await getPlacedStudents();
};

export const getPlacedStudentsUpdatedEventName = () =>
  "placed-students-updated";
