import axios from "axios";

// ✅ Set your backend base URL here
// Example: "http://localhost:5000/api" or your deployed API
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // optional if backend uses cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically before every request
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global error handler (e.g., auto-logout on token expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
    