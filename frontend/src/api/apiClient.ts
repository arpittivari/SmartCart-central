import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the user data from local storage
    const userString = localStorage.getItem('smartcartUser');
    
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.token) {
        // If the token exists, add it to the Authorization header
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;