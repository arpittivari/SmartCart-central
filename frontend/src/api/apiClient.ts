import axios from 'axios';

// This is the final, correct logic.
// Plan A: Use the production URL from Vercel's environment.
// Plan B (Fallback): Use the local development URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// This will log which URL is being used, so you can always verify.
console.log("Connecting to API at:", API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// The interceptor that automatically adds your login token is perfect and should stay.
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