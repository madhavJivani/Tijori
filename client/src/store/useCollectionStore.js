import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  createCollection, 
  renameCollection, 
  getCollection, 
  getCollections, 
  deleteCollection 
} from '../api/collectionAPI.js';

const useCollectionStore = create(
  persist(
    (set, get) => ({
      // Collection state
      collections: [],
      currentCollection: null,
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

      setCurrentCollection: (collection) =>
        set(() => ({
          currentCollection: collection,
        })),

      // API Actions
      createCollection: async (collectionName) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await createCollection({ collectionName });
          
          // Add new collection to the beginning of collections list
          const currentCollections = get().collections;
          set(() => ({
            collections: [response.collection, ...currentCollections],
            loading: false,
            error: null,
          }));
          
          return response;
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to create collection' 
          }));
          throw error;
        }
      },

      renameCollection: async (collectionId, newCollectionName) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await renameCollection(collectionId, newCollectionName);
          
          // Update collection in collections list
          const currentCollections = get().collections;
          const updatedCollections = currentCollections.map(collection =>
            collection.id === collectionId 
              ? { ...collection, ...response.collection }
              : collection
          );
          
          // Update current collection if it's the one being renamed
          const currentCollection = get().currentCollection;
          const updatedCurrentCollection = currentCollection?.id === collectionId
            ? { ...currentCollection, ...response.collection }
            : currentCollection;
          
          set(() => ({
            collections: updatedCollections,
            currentCollection: updatedCurrentCollection,
            loading: false,
            error: null,
          }));
          
          return response;
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to rename collection' 
          }));
          throw error;
        }
      },

      fetchCollection: async (collectionId) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await getCollection(collectionId);
          
          set(() => ({
            currentCollection: {
              ...response.collection,
              fileCount: response.fileCount
            },
            loading: false,
            error: null,
          }));
          
          return response;
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to fetch collection' 
          }));
          throw error;
        }
      },

      fetchCollections: async (options = {}) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await getCollections(options);
          
          const { append = false } = options;
          const currentCollections = get().collections;
          
          set(() => ({
            collections: append 
              ? [...currentCollections, ...response.collections]
              : response.collections,
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
            error: error.message || 'Failed to fetch collections' 
          }));
          throw error;
        }
      },

      deleteCollection: async (collectionId) => {
        set(() => ({ loading: true, error: null }));
        try {
          await deleteCollection(collectionId);
          
          // Remove collection from collections list
          const currentCollections = get().collections;
          const updatedCollections = currentCollections.filter(
            collection => collection.id !== collectionId
          );
          
          // Clear current collection if it's the one being deleted
          const currentCollection = get().currentCollection;
          const updatedCurrentCollection = currentCollection?.id === collectionId
            ? null
            : currentCollection;
          
          set(() => ({
            collections: updatedCollections,
            currentCollection: updatedCurrentCollection,
            loading: false,
            error: null,
          }));
          
          return { success: true };
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Failed to delete collection' 
          }));
          throw error;
        }
      },

      // Load more collections (pagination)
      loadMoreCollections: async () => {
        const { pagination } = get();
        const nextPage = pagination.page + 1;
        
        return get().fetchCollections({
          page: nextPage,
          qty: pagination.qty,
          order: pagination.order,
          append: true
        });
      },

      // Refresh collections
      refreshCollections: async () => {
        const { pagination } = get();
        return get().fetchCollections({
          page: 1,
          qty: pagination.qty,
          order: pagination.order,
          append: false
        });
      },

      // Clear all collection data
      clearCollections: () => 
        set(() => ({
          collections: [],
          currentCollection: null,
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
      getCollectionById: (id) => get().collections.find(collection => collection.id === id),
      hasMoreCollections: () => {
        const { pagination } = get();
        return pagination.current < pagination.total;
      },
      getCollectionCount: () => get().collections.length,
    }),
    {
      name: 'collection-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        collections: state.collections,
        currentCollection: state.currentCollection,
        pagination: state.pagination,
      }), // Only persist specific fields (exclude loading, error states)
    }
  )
);

export default useCollectionStore;
