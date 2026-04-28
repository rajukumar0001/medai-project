import api from './axios';

export const uploadReport = (formData, onProgress) =>
  api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    }
  });

export const getReports = (params) =>
  api.get('/reports', { params });

export const getReport = (id) =>
  api.get(`/reports/${id}`);

export const deleteReport = (id) =>
  api.delete(`/reports/${id}`);

export const downloadReport = (id) =>
  api.get(`/reports/${id}/download`, { responseType: 'blob' });

export const toggleReportFavorite = (id) =>
  api.patch(`/reports/${id}/favorite`);
