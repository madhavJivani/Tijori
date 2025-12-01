import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  createFile, 
  getFiles, 
  getFile, 
  renameFile, 
  deleteFile 
} from '../api/fileAPI.js';

const useFileStore = create(
  persist(
    (set, get) => ({
      // File state
      files: [],
      currentFile: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        qty: 20,
        order: 'desc',
        total: 0,
        current: 0
      },

      // Actions
      setLoading: (loading) => 
        set(() => ({
          loading,
        })),

      setError: (error) => 
        set(() => ({
          error,
          loading: false,
        })),

      clearError: () => 
        set(() => ({
          error: null,
        })),

      setCurrentFile: (file) =>
        set(() => ({
          currentFile: file,
        })),

      // API Actions
      createFile: async ({ fileName, collections, document }) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await createFile({ fileName, collections, document });
          
          // Add new file to the beginning of files list
          const currentFiles = get().files;
          set(() => ({
            files: [response.newFile, ...currentFiles],
            loading: false,
            error: null,
          }));
          
          return response;
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to create file' 
          }));
          throw error;
        }
      },

      renameFile: async (fileId, newFileName) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await renameFile(fileId, newFileName);
          
          // Update file in files list
          const currentFiles = get().files;
          const updatedFiles = currentFiles.map(file =>
            file.id === fileId 
              ? { ...file, ...response.updatedFile }
              : file
          );
          
          // Update current file if it's the one being renamed
          const currentFile = get().currentFile;
          const updatedCurrentFile = currentFile?.id === fileId
            ? { ...currentFile, ...response.updatedFile }
            : currentFile;
          
          set(() => ({
            files: updatedFiles,
            currentFile: updatedCurrentFile,
            loading: false,
            error: null,
          }));
          
          return response;
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to rename file' 
          }));
          throw error;
        }
      },

      fetchFile: async (fileId, mode = 'view') => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await getFile(fileId, mode);
          
          set(() => ({
            currentFile: response.file,
            loading: false,
            error: null,
          }));
          
          return response;
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to fetch file' 
          }));
          throw error;
        }
      },

      fetchFiles: async (options = {}) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await getFiles(options);
          
          const { append = false } = options;
          const currentFiles = get().files;
          
          set(() => ({
            files: append 
              ? [...currentFiles, ...response.files]
              : response.files,
            pagination: {
              page: response.info.page,
              qty: response.info.qty,
              order: response.info.order,
              total: response.count.total,
              current: response.count.current
            },
            loading: false,
            error: null,
          }));
          
          return response;
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to fetch files' 
          }));
          throw error;
        }
      },

      deleteFile: async (fileId) => {
        set(() => ({ loading: true, error: null }));
        try {
          await deleteFile(fileId);
          
          // Remove file from files list
          const currentFiles = get().files;
          const updatedFiles = currentFiles.filter(
            file => file.id !== fileId
          );
          
          // Clear current file if it's the one being deleted
          const currentFile = get().currentFile;
          const updatedCurrentFile = currentFile?.id === fileId
            ? null
            : currentFile;
          
          set(() => ({
            files: updatedFiles,
            currentFile: updatedCurrentFile,
            loading: false,
            error: null,
          }));
          
          return { success: true };
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to delete file' 
          }));
          throw error;
        }
      },

      // Load more files (pagination)
      loadMoreFiles: async () => {
        const { pagination } = get();
        const nextPage = pagination.page + 1;
        
        return get().fetchFiles({
          page: nextPage,
          qty: pagination.qty,
          order: pagination.order,
          append: true
        });
      },

      // Refresh files
      refreshFiles: async () => {
        const { pagination } = get();
        return get().fetchFiles({
          page: 1,
          qty: pagination.qty,
          order: pagination.order,
          append: false
        });
      },

      // Clear all file data
      clearFiles: () => 
        set(() => ({
          files: [],
          currentFile: null,
          pagination: {
            page: 1,
            qty: 20,
            order: 'desc',
            total: 0,
            current: 0
          },
          error: null,
        })),

      // Computed values
      getFileById: (id) => get().files.find(file => file.id === id),
      hasMoreFiles: () => {
        const { pagination } = get();
        return pagination.current < pagination.total;
      },
      getFileCount: () => get().files.length,

      // File management utilities
      getFilesByCollection: (collectionId) => {
        const files = get().files;
        return files.filter(file => 
          file.collections && file.collections.some(col => col.id === collectionId)
        );
      },

      // Download file utility
      downloadFile: async (fileId, fileName) => {
        try {
          const response = await getFile(fileId, 'download');
          
          // Create download link
          const link = document.createElement('a');
          link.href = response.file.fileUrl;
          link.download = fileName || response.file.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          return response;
        } catch (error) {
          set(() => ({ 
            error: error.message || 'Failed to download file' 
          }));
          throw error;
        }
      },

      // View file utility (opens in new tab)
      viewFile: async (fileId) => {
        try {
          const response = await getFile(fileId, 'view');
          
          // Open file in new tab
          window.open(response.file.fileUrl, '_blank');
          
          return response;
        } catch (error) {
          set(() => ({ 
            error: error.message || 'Failed to view file' 
          }));
          throw error;
        }
      },
    }),
    {
      name: 'file-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        files: state.files,
        currentFile: state.currentFile,
        pagination: state.pagination,
      }), // Only persist specific fields (exclude loading, error states)
    }
  )
);

export default useFileStore;
