import axios from 'axios';

// This is the crucial logic. It reads the production URL from the Vercel environment.
// If it's not there (in local dev), it defaults to your local backend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// The interceptor that automatically adds your token is perfect and should stay.
apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('smartcartUser');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;