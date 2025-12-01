import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { registerUser, loginUser, getUserProfile, logoutUser } from '../api/userAPI.js';

const useUserStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      authToken: '',
      loading: false,
      error: null,

      // Actions
      setUser: (userData) => 
        set(() => ({
          user: userData,
          isAuthenticated: !!userData,
          error: null,
        })),

      setAuthToken: (token) => 
        set(() => ({
          authToken: token,
        })),

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

      // API Actions
      register: async (userData) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await registerUser(userData);
          set(() => ({ 
            loading: false,
            error: null 
          }));
          return response;
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Registration failed' 
          }));
          throw error;
        }
      },

      login: async (credentials) => {
        set(() => ({ loading: true, error: null }));
        try {
          const response = await loginUser(credentials);
          
          // Get user profile after successful login
          const profileData = await getUserProfile();
          
          // Enhance user object with counts from profile data
          const userWithCounts = {
            ...profileData.user,
            userFileCount: profileData.fileCount || 0,
            userCollectionCount: profileData.collectionCount || 0,
          };
          
          set(() => ({
            user: userWithCounts,
            authToken: response.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          }));
          
          return { ...response, profile: profileData };
        } catch (error) {
          set(() => ({ 
            loading: false, 
            error: error.message || 'Login failed' 
          }));
          throw error;
        }
      },

      fetchProfile: async () => {
        set(() => ({ loading: true, error: null }));
        try {
          const profileData = await getUserProfile();
          
          // Enhance user object with counts from profile data
          const userWithCounts = {
            ...profileData.user,
            userFileCount: profileData.fileCount || 0,
            userCollectionCount: profileData.collectionCount || 0,
          };
          
          set(() => ({
            user: userWithCounts,
            isAuthenticated: true,
            loading: false,
            error: null,
          }));
          return profileData;
        } catch (error) {
          // If profile fetch fails, user is not authenticated - clear auth state
          set(() => ({ 
            user: null,
            isAuthenticated: false,
            authToken: '',
            loading: false, 
            error: null // Don't show error for this case
          }));
          throw error;
        }
      },

      logout: async () => {
        set(() => ({ loading: true, error: null }));
        try {
          await logoutUser();
          set(() => ({
            user: null,
            authToken: '',
            isAuthenticated: false,
            loading: false,
            error: null,
          }));
        } catch (error) {
          // Even if logout API fails, clear local state
          set(() => ({
            user: null,
            authToken: '',
            isAuthenticated: false,
            loading: false,
            error: null,
          }));
        }
      },

      // Computed values
      getUserId: () => get().user?.id,
      getUsername: () => get().user?.username,
      getUserEmail: () => get().user?.email,
      isLoggedIn: () => !!get().user && !!get().authToken,
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
      }), // Only persist specific fields (exclude loading, error states)
    }
  )
);

export default useUserStore;
