import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfileClick = () => {
    // const token =
    //   localStorage.getItem("token") || sessionStorage.getItem("token");

    // if (token) {
      navigate("/profile");
    // } else {
    //   navigate("/login");
    // }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          FileVault
        </Link>

        <div className="flex items-center gap-6">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <FaUserCircle size={20} /> Profile
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
