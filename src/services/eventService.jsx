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

// Event CRUD operations
export const getEvents = (projectId, activityId) => 
  API.get(`/${projectId}/activities/${activityId}/events`);

// Get event statistics for ALL events in an activity (for progress bar)
export const getEventStats = (projectId, activityId) => 
  API.get(`/${projectId}/activities/${activityId}/events/stats`);

// Get task statistics for a SPECIFIC event (for task progress)
export const getTaskStatsForEvent = (projectId, activityId, eventId) => 
  API.get(`/${projectId}/activities/${activityId}/events/${eventId}/tasks/stats`);

export const getEvent = (projectId, activityId, eventId) => 
  API.get(`/${projectId}/activities/${activityId}/events/${eventId}`);

export const createEvent = (projectId, activityId, data) => 
  API.post(`/${projectId}/activities/${activityId}/events`, data);

export const updateEvent = (projectId, activityId, eventId, data) => 
  API.put(`/${projectId}/activities/${activityId}/events/${eventId}`, data);

export const deleteEvent = (projectId, activityId, eventId) => 
  API.delete(`/${projectId}/activities/${activityId}/events/${eventId}`);

// Get event with all tasks (for event detail page)
export const getEventWithTasks = (projectId, activityId, eventId) => 
  API.get(`/${projectId}/activities/${activityId}/events/${eventId}/details`);