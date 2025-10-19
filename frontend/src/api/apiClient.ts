import axios from 'axios';

// This is the crucial logic. It reads the production URL from Vercel's environment.
// If it's not there (on your local PC), it correctly defaults to localhost.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// --- THIS IS THE "EVIDENCE" ---
// This will print the URL to the browser console, so we can see what the app is actually using.
console.log("Application is configured to connect to API at:", API_BASE_URL);
// ----------------------------

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