import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach Entra ID token + role
api.interceptors.request.use(
  (config) => {
    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    const role = localStorage.getItem("role");
    if (role) {
      config.headers["X-User-Role"] = role;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — clear session on 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("idToken");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
