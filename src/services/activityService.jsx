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

// Activity CRUD operations
export const getActivities = (projectId) => API.get(`/${projectId}/activities`);
export const getActivity = (projectId, activityId) => API.get(`/${projectId}/activities/${activityId}`);
export const createActivity = (projectId, data) => API.post(`/${projectId}/activities`, data);
export const updateActivity = (projectId, activityId, data) => API.put(`/${projectId}/activities/${activityId}`, data);
export const deleteActivity = (projectId, activityId) => API.delete(`/${projectId}/activities/${activityId}`);