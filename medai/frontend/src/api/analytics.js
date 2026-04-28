import api from './axios';

export const getDashboardAnalytics = () =>
  api.get('/analytics/dashboard');

export const getTrends = (days = 30) =>
  api.get('/analytics/trends', { params: { days } });
