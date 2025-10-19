import axios from 'axios';

// ✅ Choose base URL automatically from env or fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log("🌍 API Base URL:", API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Add user token automatically
apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('smartcartUser');
    if (userString) {
      const user = JSON.parse(userString);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
