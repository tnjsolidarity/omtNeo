import axios from "axios";

// Use Vite environment variable
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/members`,
});

// Add token from localStorage to Authorization header
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getMembers = () => API.get("/");
export const createMember = (data) => API.post("/", data);
export const updateMember = (id, data) => API.put(`/${id}`, data);
export const deleteMember = (id) => API.delete(`/${id}`);