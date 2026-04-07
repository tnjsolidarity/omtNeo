import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/projects`,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Task CRUD operations
export const getTasks = (projectId, activityId, eventId) => 
  API.get(`/${projectId}/activities/${activityId}/events/${eventId}/tasks`);

export const getTaskStats = (projectId, activityId, eventId) => 
  API.get(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/stats`);

export const getTask = (projectId, activityId, eventId, taskId) => 
  API.get(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/${taskId}`);

export const createTask = (projectId, activityId, eventId, data) => 
  API.post(`/${projectId}/activities/${activityId}/events/${eventId}/tasks`, data);

export const updateTask = (projectId, activityId, eventId, taskId, data) => 
  API.put(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/${taskId}`, data);

export const deleteTask = (projectId, activityId, eventId, taskId) => 
  API.delete(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/${taskId}`);

// Comments
export const addComment = (projectId, activityId, eventId, taskId, text) => 
  API.post(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/${taskId}/comments`, { text });

export const deleteComment = (projectId, activityId, eventId, taskId, commentId) => 
  API.delete(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/${taskId}/comments/${commentId}`);

// Attachments
export const addAttachment = (projectId, activityId, eventId, taskId, attachment) => 
  API.post(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/${taskId}/attachments`, attachment);

export const deleteAttachment = (projectId, activityId, eventId, taskId, attachmentId) => 
  API.delete(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/${taskId}/attachments/${attachmentId}`);