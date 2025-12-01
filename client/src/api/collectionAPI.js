import axios from 'axios';
import { BACKEND_URL } from './api.js';

// Create collection
export const createCollection = async (collectionData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/collections/create`, collectionData, {
      withCredentials: true, // For cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Rename collection
export const renameCollection = async (collectionId, newCollectionName) => {
  try {
    const response = await axios.put(`${BACKEND_URL}/api/collections`, null, {
      params: {
        collectionId,
        newCollectionName
      },
      withCredentials: true, // For cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single collection by ID
export const getCollection = async (collectionId) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/collections`, {
      collectionId
    }, {
      withCredentials: true, // For cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all collections with pagination and sorting
export const getCollections = async (options = {}) => {
  try {
    const { order = 'desc', qty = 20, page = 1 } = options;
    
    const response = await axios.get(`${BACKEND_URL}/api/collections`, {
      params: {
        order,
        qty,
        page
      },
      withCredentials: true, // For cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete collection
export const deleteCollection = async (collectionId) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/api/collections`, {
      params: {
        collectionId
      },
      withCredentials: true, // For cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
