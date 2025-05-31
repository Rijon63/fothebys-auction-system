// src/utils/axios.config.js
import axios from 'axios';

// Create a base instance of axios with the correct backend URL
const api = axios.create({
  baseURL: 'http://localhost:8081',  // Match your Express server port
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;