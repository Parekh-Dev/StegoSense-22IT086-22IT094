// API Configuration - Fixed for Docker local development
export const API_BASE_URL = (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') 
  ? 'https://stegosense-production.up.railway.app'
  : 'http://localhost:5001';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  UPLOAD: `${API_BASE_URL}/api/upload`,
  CNN_RNN_DETECT: `${API_BASE_URL}/api/cnn-rnn-test/detect`,
  HISTORY: {
    GET: `${API_BASE_URL}/api/history`,
    STATS: `${API_BASE_URL}/api/history/stats`,
    DELETE: (id) => `${API_BASE_URL}/api/history/${id}`,
    CLEAR_ALL: `${API_BASE_URL}/api/history/clear/all`,
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
