import axios from "axios";

// Use Vite environment variable
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/attendances`,
});

// Add token to all requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Add response interceptor for better error logging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Attendance CRUD operations
export const createAttendance = async (data) => {
  try {
    // Ensure date is properly formatted
    const formattedData = {
      ...data,
      date: data.date ? new Date(data.date) : new Date()
    };
    
    const response = await API.post("/", formattedData);
    return response;
  } catch (error) {
    console.error('Create attendance error details:', error.response?.data);
    throw error;
  }
};

export const getAllAttendances = (filters = {}) => {
  const cleanFilters = {};
  Object.keys(filters).forEach(key => {
    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
      cleanFilters[key] = filters[key];
    }
  });
  const queryParams = new URLSearchParams(cleanFilters).toString();
  const url = queryParams ? `/?${queryParams}` : '/';
  return API.get(url);
};

export const getAttendanceById = (id) => API.get(`/${id}`);
export const updateAttendance = async (id, data) => {
  try {
    // Ensure date is properly formatted
    const formattedData = {
      ...data,
      date: data.date ? new Date(data.date) : new Date()
    };
    
    const response = await API.put(`/${id}`, formattedData);
    return response;
  } catch (error) {
    console.error('Update attendance error details:', error.response?.data);
    throw error;
  }
};
export const deleteAttendance = (id) => API.delete(`/${id}`);

// Get attendances for a specific event
export const getAttendancesForEvent = async (projectId, activityId, eventId) => {
  try {
    const response = await API.get("/");
    let allAttendances = [];
    
    if (response.data && Array.isArray(response.data)) {
      allAttendances = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      allAttendances = response.data.data;
    } else if (response.data && response.data.attendances && Array.isArray(response.data.attendances)) {
      allAttendances = response.data.attendances;
    } else if (Array.isArray(response.data)) {
      allAttendances = response.data;
    }
    
    const filteredAttendances = allAttendances.filter(attendance => 
      attendance.event === eventId || 
      attendance.event?._id === eventId ||
      attendance.eventId === eventId
    );
    
    return { data: filteredAttendances };
  } catch (error) {
    console.error('Error fetching attendances for event:', error);
    return { data: [] };
  }
};

// Create attendance for a specific event
export const createAttendanceForEvent = async (projectId, activityId, eventId, attendanceData) => {
  const data = {
    ...attendanceData,
    event: eventId,
    project: projectId,
    activity: activityId
  };
  return createAttendance(data);
};

// Update attendance with event context
export const updateAttendanceForEvent = async (projectId, activityId, eventId, attendanceId, attendanceData) => {
  return updateAttendance(attendanceId, attendanceData);
};

// Delete attendance with event context
export const deleteAttendanceForEvent = async (projectId, activityId, eventId, attendanceId) => {
  return deleteAttendance(attendanceId);
};

export const getAttendanceStats = () => API.get("/stats");

export const updateInviteeStatus = (attendanceId, inchargeId, inviteeId, statusData) =>
  API.put(`/${attendanceId}/incharge/${inchargeId}/invitee/${inviteeId}`, statusData);

export const bulkUpdateInviteeStatus = (attendanceId, updates) =>
  API.put(`/${attendanceId}/bulk-update`, { updates });