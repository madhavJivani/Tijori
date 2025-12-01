export { default as useUserStore } from './userStore.js';
export { default as useCollectionStore } from './useCollectionStore.js';
export { default as useFileStore } from './useFileStore.js';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";