import axios from 'axios';
import { BACKEND_URL } from './api.js';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Important for cookie-based authentication
});

/**
 * Create a new file (single file upload only)
 * @param {Object} fileData - File data including fileName, collections array, and file
 * @param {string} fileData.fileName - Name of the file
 * @param {Array} fileData.collections - Array of collection IDs
 * @param {File} fileData.document - The actual file object (single file only)
 * @returns {Promise} API response
 */
export const createFile = async ({ fileName, collections, document }) => {
  try {
    const formData = new FormData();
    formData.append('fileName', fileName);
    formData.append('collections', JSON.stringify(collections)); // Stringify array as required by backend
    formData.append('document', document); // Multer expects 'document' field name

    const response = await api.post('/api/files/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating file:', error);
    throw error.response?.data || { message: 'Failed to create file' };
  }
};

/**
 * Get all files with pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.qty - Items per page (default: 20)
 * @param {string} options.order - Sort order 'asc' or 'desc' (default: 'desc')
 * @returns {Promise} API response with files list
 */
export const getFiles = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page);
    if (options.qty) params.append('qty', options.qty);
    if (options.order) params.append('order', options.order);

    const response = await api.get(`/api/files?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error.response?.data || { message: 'Failed to fetch files' };
  }
};

/**
 * Get a specific file with URL
 * @param {string} fileId - File ID
 * @param {string} mode - 'view' or 'download'
 * @returns {Promise} API response with file data and URL
 */
export const getFile = async (fileId, mode = 'view') => {
  try {
    const response = await api.post('/api/files/', {
      fileId,
      mode
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error.response?.data || { message: 'Failed to fetch file' };
  }
};

/**
 * Rename a file
 * @param {string} fileId - File ID
 * @param {string} newFileName - New name for the file
 * @returns {Promise} API response
 */
export const renameFile = async (fileId, newFileName) => {
  try {
    const response = await api.put(`/api/files?fileId=${fileId}&newFileName=${encodeURIComponent(newFileName)}`);
    return response.data;
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error.response?.data || { message: 'Failed to rename file' };
  }
};

/**
 * Delete a file
 * @param {string} fileId - File ID to delete
 * @returns {Promise} API response
 */
export const deleteFile = async (fileId) => {
  try {
    const response = await api.delete(`/api/files?fileId=${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error.response?.data || { message: 'Failed to delete file' };
  }
};
