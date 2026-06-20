import client from "./client.js";

const fallbackDashboard = {
  stats: {
    totalStudents: 0,
    activeCourses: 0,
    internships: 0,
    placements: 0,
  },
  recentStudents: [],
};

export const getAdminDashboard = async () => {
  try {
    const response = await client.get("/dashboard/admin");
    return response.data.data || fallbackDashboard;
  } catch (error) {
    console.error("Error fetching admin dashboard", error);
    return fallbackDashboard;
  }
};
