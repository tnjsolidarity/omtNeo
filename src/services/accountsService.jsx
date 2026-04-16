import axios from "axios";

// Use Vite environment variable
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/accounts`,
});

// Add token from localStorage to Authorization header
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ==================== INCOME SERVICE ====================
export const getIncomes = () => API.get("/incomes");
export const createIncome = (data) => API.post("/incomes", data);
export const updateIncome = (id, data) => API.put(`/incomes/${id}`, data);
export const deleteIncome = (id) => API.delete(`/incomes/${id}`);

// ==================== EXPENSE SERVICE ====================
export const getExpenses = () => API.get("/expenses");
export const createExpense = (data) => API.post("/expenses", data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// ==================== DUE SERVICE ====================
export const getDues = () => API.get("/dues");
export const createDue = (data) => API.post("/dues", data);
export const updateDue = (id, data) => API.put(`/dues/${id}`, data);
export const deleteDue = (id) => API.delete(`/dues/${id}`);

// ==================== SUMMARY SERVICE ====================
export const getAccountsSummary = () => API.get("/summary");
