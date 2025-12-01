import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaFile,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaDownload,
  FaEye,
  FaCalendarAlt,
  FaFolder
} from "react-icons/fa";
import toast from 'react-hot-toast';
import { useFileStore, useUserStore } from "../store";

const FileItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useUserStore();
  const {
    files,
    loading,
    fetchFile,
    renameFile,
    deleteFile,
    currentFile,
    downloadFile,
    viewFile
  } = useFileStore();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Fetch file details when component mounts
  useEffect(() => {
    if (id) {
      fetchFile(id, 'view').catch((error) => {
        toast.error('Failed to load file details');
        console.error('Failed to fetch file:', error);
      });
    }
  }, [id, fetchFile]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle rename file
  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error('File name cannot be empty');
      return;
    }

    const loadingToast = toast.loading('Renaming file...');
    try {
      await renameFile(id, newName.trim());
      toast.success('File renamed successfully!', { id: loadingToast });
      setIsRenaming(false);
      setNewName("");
    } catch (error) {
      toast.error('Failed to rename file', { id: loadingToast });
      console.error('Failed to rename file:', error);
    }
  };

  // Handle delete file
  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
    setDeleteConfirmText("");
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      toast.error('Please type "delete" to confirm');
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading('Deleting file...');
    try {
      await deleteFile(id);
      toast.success('File deleted successfully!', { id: loadingToast });
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to delete file', { id: loadingToast });
      console.error('Failed to delete file:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmText("");
  };

  // Handle download file
  const handleDownload = async () => {
    try {
      await downloadFile(id, file?.fileName);
      toast.success('File download started!');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  // Handle view file
  const handleView = async () => {
    try {
      await viewFile(id);
      toast.success('File opened in new tab!');
    } catch (error) {
      toast.error('Failed to open file');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Loading file...</span>
        </div>
      </div>
    );
  }

  // Get file data (prefer currentFile from store, fallback to files array)
  const file = currentFile || files.find((f) => f.id === id);

  // File not found
  if (!file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">File not found</h2>
          <p className="text-gray-600 mb-6">The file you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </button>
        </div>
      </div>
    );
  }

  // Get file extension for icon styling
  const getFileExtension = (fileName) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const fileExtension = getFileExtension(file.fileName);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';
  const isDocument = ['doc', 'docx', 'txt', 'rtf'].includes(fileExtension);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </button>
          </div>

          {/* File Info */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <FaFile className="w-10 h-10 text-green-600" />
            </div>
            <div className="flex-1">
              {isRenaming ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-3xl font-bold text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                  />
                  <button
                    onClick={handleRename}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsRenaming(false);
                      setNewName("");
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {file.fileName}
                </h1>
              )}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span>Uploaded {formatDate(file.createdAt)}</span>
                </div>
                {file.updatedAt !== file.createdAt && (
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>Updated {formatDate(file.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">

            {(!isRenaming && !showDeleteConfirmation) && (
              <>
                <button
                  onClick={handleView}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
                >
                  <FaEye className="w-4 h-4" />
                  <span>View</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setNewName(file.fileName);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center space-x-2 text-sm"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Rename</span>
                </button>

                <button
                  onClick={handleDeleteClick}
                  disabled={showDeleteConfirmation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2 text-sm"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Section */}
        {showDeleteConfirmation && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-red-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FaTrash className="w-5 h-5 text-red-600" />
              <span>Delete File</span>
            </h3>

            <div className="space-y-4">
              {/* Warning Message */}
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <div>
                    <p className="font-medium text-red-900 mb-1">
                      This action cannot be undone
                    </p>
                    <p className="text-sm text-red-700">
                      This will permanently delete the file "{file.fileName}" from your vault.
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-1 rounded">delete</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  disabled={isDeleting}
                  placeholder="Type 'delete' here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && handleDeleteConfirm()}
                />
              </div>

              {/* Delete Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmText.toLowerCase() !== 'delete' || isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FaTrash className="w-4 h-4" />
                      <span>Delete File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Preview Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">File Preview</h2>

          {file.fileUrl ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {isImage ? (
                <img
                  src={file.fileUrl}
                  alt={file.fileName}
                  className="w-full max-h-96 object-contain bg-gray-50"
                />
              ) : isPdf ? (
                <iframe
                  src={file.fileUrl}
                  className="w-full h-96"
                  title={file.fileName}
                />
              ) : (
                <div className="p-8 text-center">
                  <FaFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <div className="space-x-2">
                    <button
                      onClick={handleView}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View File
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Download File
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <FaFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading file preview...</p>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">File Information</h2>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">File Name</dt>
              <dd className="text-sm text-gray-900 mt-1">{file.fileName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">File Type</dt>
              <dd className="text-sm text-gray-900 mt-1">{fileExtension.toUpperCase()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
              <dd className="text-sm text-gray-900 mt-1">{formatDate(file.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
              <dd className="text-sm text-gray-900 mt-1">{formatDate(file.updatedAt)}</dd>
            </div>
          </dl>
        </div>


      </div>
    </div>
  );
};

export default FileItem;
