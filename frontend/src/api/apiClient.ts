import axios from 'axios';

// This is the crucial logic that makes the code work in both environments.
// 1. It looks for the VITE_API_BASE_URL variable. This variable will ONLY exist in your Vercel deployment.
// 2. If it can't find it (i.e., you are running `npm run dev` on your local PC),
//    it correctly defaults to your local backend server address.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// This interceptor is a professional pattern that automatically attaches
// the user's JWT token to the header of every single API request.
// This is essential for a secure application and does not need to be changed.
apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('smartcartUser');
    
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.token) {
        // Add the 'Bearer' token to the Authorization header
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    // This allows Axios to handle request errors normally
    return Promise.reject(error);
  }
);

export default apiClient;