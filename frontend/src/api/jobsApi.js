import client from "./client.js";

export const getJobs = async () => {
  try {
    const response = await client.get("/jobs");
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching jobs", error);
    return [];
  }
};

export const saveJobs = async (jobs) => {
  // Note: Typically not implemented as batch in REST, usually save individually
};

export const addJob = async (jobInput) => {
  await client.post("/jobs", jobInput);
  return await getJobs();
};

export const updateJob = async (id, jobInput) => {
  await client.put(`/jobs/${id}`, jobInput);
  return await getJobs();
};

export const deleteJob = async (id) => {
  await client.delete(`/jobs/${id}`);
  return await getJobs();
};

export const getJobsUpdatedEventName = () => "jobs-updated";
