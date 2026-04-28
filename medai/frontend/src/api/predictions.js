import api from './axios';

export const predictDisease = (diseaseType, inputData) =>
  api.post('/predictions/predict', { diseaseType, inputData });

export const getPredictionHistory = (params) =>
  api.get('/predictions/history', { params });

export const getPrediction = (id) =>
  api.get(`/predictions/${id}`);

export const deletePrediction = (id) =>
  api.delete(`/predictions/${id}`);

export const getPredictionStats = () =>
  api.get('/predictions/stats');

export const togglePredictionFavorite = (id) =>
  api.patch(`/predictions/${id}/favorite`);
