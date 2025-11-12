import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full md:w-80">
      <FaSearch className="absolute left-3 top-3 text-gray-400" />
      <input
        type="text"
        placeholder="Search files..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>
  );
}
