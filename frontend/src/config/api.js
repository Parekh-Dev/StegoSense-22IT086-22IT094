// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://stegosense-production.up.railway.app'
  : 'http://127.0.0.1:5001';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  UPLOAD: `${API_BASE_URL}/api/upload`,
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
