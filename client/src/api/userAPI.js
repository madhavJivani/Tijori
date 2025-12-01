import axios from 'axios';
import { BACKEND_URL } from './api.js';

// User registration
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/users/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// User login
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/users/login`, credentials, {
      withCredentials: true, // For cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user profile (requires authentication)
export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/users/profile`, {
      withCredentials: true, // For cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// User logout
export const logoutUser = async () => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/users/logout`, {}, {
      withCredentials: true, // For cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
