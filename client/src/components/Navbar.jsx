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
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          <FaVault size={30} className="inline-block mr-2 bg-blue-100 rounded-full p-1" />
          Tijori
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/collection" 
            className={`transition ${
              isCollectionActive 
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' 
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            My Collections
          </Link>
          <Link 
            to="/file" 
            className={`transition ${
              isFileActive 
                ? 'text-green-600 font-semibold border-b-2 border-green-600 pb-1' 
                : 'text-gray-700 hover:text-green-600'
            }`}
          >
            My Files
          </Link>
        </div>
        <div className="flex items-center gap-6">
          {loading && !isAuthenticated &&(
            <div className="text-gray-600">Loading...</div>
          )}
          
          {isAuthenticated ? (
            <>
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <FaUserCircle size={20} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
