/**
 * API Service Layer
 * All API call functions organized by feature
 */
import api from './axios';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteAccount: () => api.delete('/users/account'),
};

// ── Predictions ───────────────────────────────────────────────────────────────
export const predictionsAPI = {
  predict: (diseaseType, inputData) => api.post('/predictions/predict', { diseaseType, inputData }),
  getHistory: (params) => api.get('/predictions/history', { params }),
  getPrediction: (id) => api.get(`/predictions/${id}`),
  deletePrediction: (id) => api.delete(`/predictions/${id}`),
  toggleFavorite: (id) => api.patch(`/predictions/${id}/favorite`),
  getStats: () => api.get('/predictions/stats'),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsAPI = {
  upload: (formData, onProgress) => api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total))
  }),
  getReports: (params) => api.get('/reports', { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  toggleFavorite: (id) => api.patch(`/reports/${id}/favorite`),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

// ── Chatbot ───────────────────────────────────────────────────────────────────
export const chatbotAPI = {
  sendMessage: (message, history) => api.post('/chatbot/message', { message, history }),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: () => api.get('/appointments'),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// ── Reminders ─────────────────────────────────────────────────────────────────
export const remindersAPI = {
  create: (data) => api.post('/reminders', data),
  getAll: () => api.get('/reminders'),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTrends: (days) => api.get('/analytics/trends', { params: { days } }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  getLogs: () => api.get('/admin/logs'),
};
