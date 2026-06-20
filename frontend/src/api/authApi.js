import client from "./client";

export const registerSendOtp = async (userData) => {
  const response = await client.post("/auth/student/register", userData);
  return response.data;
};

export const registerVerifyOtp = async (email, otp) => {
  const response = await client.post("/auth/student/register/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

export const loginStudent = async (credentials) => {
  const response = await client.post("/auth/student/login", credentials);
  return response.data;
};

export const loginAdmin = async (credentials) => {
  const response = await client.post("/auth/admin/login", credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await client.get("/auth/me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await client.post("/auth/logout");
  return response.data;
};
