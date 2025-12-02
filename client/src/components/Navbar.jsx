import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FaVault } from "react-icons/fa6";
import { useUserStore } from "../store";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    user, 
    isAuthenticated, 
    loading, 
    logout, 
    fetchProfile 
  } = useUserStore();

  // Check if current path matches collection or file routes
  const isCollectionActive = location.pathname.startsWith('/collection');
  const isFileActive = location.pathname.startsWith('/file');

  // Fetch user profile on component mount if authenticated but no user data
  useEffect(() => {
    if (isAuthenticated && !user && !loading) {
      fetchProfile().catch(() => {
        // If fetch fails, user might need to login again
        navigate("/login");
      });
    }
  }, [isAuthenticated, user, loading, fetchProfile, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      // Even if API fails, we've cleared local state
      navigate("/login");
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <FaVault className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              Tijori
            </span>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/collection" 
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                isCollectionActive 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              My Collections
            </Link>
            <Link 
              to="/file" 
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                isFileActive 
                  ? 'bg-green-100 text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              My Files
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {loading && !isAuthenticated && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Loading...</span>
              </div>
            )}
            
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium text-sm"
                >
                  <FaUserCircle className="w-5 h-5" />
                  <span className="hidden sm:block">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden flex justify-center space-x-2 mt-4 pt-4 border-t border-gray-100">
            <Link 
              to="/collection" 
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                isCollectionActive 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Collections
            </Link>
            <Link 
              to="/file" 
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                isFileActive 
                  ? 'bg-green-100 text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              Files
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
