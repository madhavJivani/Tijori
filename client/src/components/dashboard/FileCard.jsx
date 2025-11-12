import React from "react";
import { FaFileAlt, FaDownload, FaTrash } from "react-icons/fa";
import dayjs from "dayjs";
import api from "../../api/api";

export default function FileCard({ file, refresh }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/files/${file._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <FaFileAlt className="text-blue-500 text-3xl" />
        <span className="text-sm text-gray-500">
          {dayjs(file.createdAt).format("MMM D, YYYY")}
        </span>
      </div>

      <h3 className="mt-3 font-semibold text-gray-800 truncate">
        {file.name}
      </h3>
      <p className="text-gray-500 text-sm mt-1">
        {(file.size / 1024).toFixed(2)} KB
      </p>

      <div className="flex justify-end gap-3 mt-4">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <FaDownload />
        </a>
        <button onClick={handleDelete} className="text-red-500 hover:text-red-700">
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
