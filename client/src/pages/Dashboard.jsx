import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import FileUpload from "../components/dashboard/FileUpload";
import FileList from "../components/dashboard/FileList";
import FileFilter from "../components/dashboard/FileFilter";
import SearchBar from "../components/dashboard/SearchBar";
import api from "../api/api";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.get("/files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data.files || []);
      setFilteredFiles(res.data.files || []);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Search + Filter logic
  useEffect(() => {
    let filtered = files;
    if (filterType !== "all") {
      filtered = filtered.filter((f) => f.type === filterType);
    }
    if (searchQuery) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredFiles(filtered);
  }, [searchQuery, filterType, files]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Your Personal File Vault
        </h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FileFilter value={filterType} onChange={setFilterType} />
        </div>

        <FileUpload onUpload={fetchFiles} />

        {loading ? (
          <Loader />
        ) : (
          <FileList files={filteredFiles} refresh={fetchFiles} />
        )}
      </div>
    </div>
  );
}
