import React, { useState } from "react";
import api from "../../api/api";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function FileUpload({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await api.post("/files/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setProgress(0);
      setSelectedFile(null);
      onUpload?.();
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  return (
    <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FaCloudUploadAlt className="text-blue-500 text-3xl" />
          <p className="font-semibold text-gray-700">Upload a File</p>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => document.getElementById("fileInput").click()}
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {uploading ? `Uploading ${progress}%` : "Select & Upload"}
        </button>
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
