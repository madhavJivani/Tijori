export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Health check endpoint
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};