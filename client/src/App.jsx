import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'

import { useUserStore, useFileStore } from './store/index.js'
import useCollectionStore from './store/useCollectionStore.js'
import CollectionItem from './pages/CollectionItem.jsx'
import CollectionList from './pages/CollectionList.jsx'
import FileItem from './pages/FileItem.jsx'
import FileList from './pages/FileList.jsx'

const App = () => {
  const { isAuthenticated, user, fetchProfile } = useUserStore();
  const { fetchCollections } = useCollectionStore();
  const { fetchFiles } = useFileStore();

  // Initialize authentication and fetch collections when app loads
  useEffect(() => {
    // Only fetch profile if user is authenticated but we don't have user data
    if (isAuthenticated && !user) {
      const initializeAuth = async () => {
        try {
          const res = await fetchProfile();
          console.log('Profile fetched on app load:', res);
        } catch (error) {
          console.error('Failed to fetch user profile on app load:', error);
          // If profile fetch fails, user is probably not actually logged in
        }
      };

      initializeAuth();
    }

    // Fetch collections and files when user is authenticated
    if (isAuthenticated) {
      const loadCollections = async () => {
        try {
          const res = await fetchCollections();
          console.log('Collections fetched on app load:', res);
        } catch (error) {
          console.error('Failed to fetch collections on app load:', error);
        }
      };

      const loadFiles = async () => {
        try {
          const res = await fetchFiles();
          console.log('Files fetched on app load:', res);
        } catch (error) {
          console.error('Failed to fetch files on app load:', error);
        }
      };

      loadCollections();
      loadFiles();
    }
  }, [isAuthenticated, user, fetchProfile, fetchCollections, fetchFiles]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/collection" element={<CollectionList />} />
        <Route path="/collection/:id" element={<CollectionItem />} />
        <Route path="/file" element={<FileList />} />
        <Route path="/file/:id" element={<FileItem />} />
      </Routes>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          // Success toasts - green with white background
          success: {
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#059669',
              border: '1px solid #34d399',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
          },
          // Error toasts - red with white background
          error: {
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#dc2626',
              border: '1px solid #f87171',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
          // Loading toasts - blue with white background
          loading: {
            style: {
              background: '#ffffff',
              color: '#2563eb',
              border: '1px solid #60a5fa',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            iconTheme: {
              primary: '#2563eb',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App