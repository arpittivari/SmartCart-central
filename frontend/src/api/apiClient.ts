import axios from 'axios';

// --- THIS IS THE TEMPORARY TEST ---
// We are temporarily hardcoding the production URL to bypass all environment variables.
const API_BASE_URL = 'https://smartcart-central.onrender.com/api';

// This will prove what URL the application is using.
console.log("DIAGNOSTIC TEST: Forcing connection to API at:", API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// The interceptor is perfect and should stay.
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