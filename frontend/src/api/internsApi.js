import client from "./client.js";

export const createInternApplication = async (payload) => {
  const response = await client.post("/interns", payload);
  return response.data;
};

export const getInternApplications = async () => {
  try {
    const response = await client.get("/interns");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching intern applications", error);
    return [];
  }
};
