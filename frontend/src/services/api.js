import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Bearer token and user role
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
      console.log(`🔑 Token: ${token.substring(0, 20)}...`);
    }
    
    if (userRole) {
      config.headers["X-User-Role"] = userRole;
      console.log(`🎭 User Role: ${userRole}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
