import axios from "axios";

// Use Vite environment variable
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/projects`,
});

// Add token to all requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Project CRUD operations
export const getProjects = () => API.get("/");
export const getProject = (id) => API.get(`/${id}`);
export const createProject = (data) => API.post("/", data);
export const updateProject = (id, data) => API.put(`/${id}`, data);
export const deleteProject = (id) => API.delete(`/${id}`);