import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaFolder, 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaFile, 
  FaCalendarAlt, 
  FaUpload,
  FaEllipsisV
} from "react-icons/fa";
import toast from 'react-hot-toast';
import { useCollectionStore, useUserStore, useFileStore } from "../store";

const CollectionItem = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isAuthenticated } = useUserStore();
    const { 
      collections, 
      loading, 
      fetchCollection, 
      renameCollection, 
      deleteCollection,
      currentCollection 
    } = useCollectionStore();
    
    const { createFile } = useFileStore();

    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState("");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    // Fetch collection details when component mounts
    useEffect(() => {
      if (id) {
        fetchCollection(id).catch((error) => {
          toast.error('Failed to load collection details');
          console.error('Failed to fetch collection:', error);
        });
      }
    }, [id, fetchCollection]);

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

    // Handle rename collection
    const handleRename = async () => {
      if (!newName.trim()) {
        toast.error('Collection name cannot be empty');
        return;
      }

      const loadingToast = toast.loading('Renaming collection...');
      try {
        await renameCollection(id, newName.trim());
        toast.success('Collection renamed successfully!', { id: loadingToast });
        setIsRenaming(false);
        setNewName("");
      } catch (error) {
        toast.error('Failed to rename collection', { id: loadingToast });
        console.error('Failed to rename collection:', error);
      }
    };

    // Handle delete collection
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
      const loadingToast = toast.loading('Deleting collection...');
      try {
        await deleteCollection(id);
        toast.success('Collection deleted successfully!', { id: loadingToast });
        navigate('/profile');
      } catch (error) {
        toast.error('Failed to delete collection', { id: loadingToast });
        console.error('Failed to delete collection:', error);
      } finally {
        setIsDeleting(false);
      }
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
      setShowDeleteConfirmation(false);
      setDeleteConfirmText("");
    };

    // Handle file upload
    const handleFileUpload = () => {
      // Trigger file input click
      document.getElementById('file-input').click();
    };

    // Handle file selection
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);
        // Set default file name (without extension for editing)
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        setFileName(nameWithoutExt || file.name);
      }
    };

    // Handle upload submission
    const handleUploadSubmit = async () => {
      if (!selectedFile) {
        toast.error('Please select a file');
        return;
      }
      
      if (!fileName.trim()) {
        toast.error('Please enter a file name');
        return;
      }

      setIsUploading(true);
      const loadingToast = toast.loading('Uploading file...');
      
      try {
        // Create file with the current collection ID
        await createFile({
          fileName: fileName.trim(),
          collections: [id], // Array containing current collection ID
          document: selectedFile
        });

        toast.success('File uploaded successfully!', { id: loadingToast });
        
        // Reset form
        setSelectedFile(null);
        setFileName("");
        
        // Refresh collection data to show new file
        fetchCollection(id);
        
      } catch (error) {
        console.error('Failed to upload file:', error);
        toast.error('Failed to upload file. Please try again.', { id: loadingToast });
      } finally {
        setIsUploading(false);
      }
    };

    // Handle clear file selection
    const handleClearFile = () => {
      setSelectedFile(null);
      setFileName("");
    };

    // Loading state
    if (loading) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading collection...</span>
            </div>
          </div>
        );
    }

    // Get collection data (prefer currentCollection from store, fallback to collections array)
    const collection = currentCollection || collections.find((col) => col.id === id);

    // Collection not found
    if (!collection) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <FaFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Collection not found</h2>
              <p className="text-gray-600 mb-6">The collection you're looking for doesn't exist or has been deleted.</p>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back to Profile</span>
              </button>
            </div>
          </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span>Back to Profile</span>
                </button>
              </div>

              {/* Collection Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <FaFolder className="w-10 h-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  {isRenaming ? (
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-3xl font-bold text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
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
                      {collection.collectionName}
                    </h1>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>Created {formatDate(collection.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaFile className="w-4 h-4" />
                      <span>{collection.fileCount || 0} files</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                {(!isRenaming && !showDeleteConfirmation && !selectedFile) && (
                  <>
                    <button
                      onClick={handleFileUpload}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm"
                    >
                      <FaUpload className="w-4 h-4" />
                      <span>Upload File</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsRenaming(true);
                        setNewName(collection.collectionName);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Rename</span>
                    </button>
                    
                    <button
                      onClick={handleDeleteClick}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 text-sm"
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
                  <span>Delete Collection</span>
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
                          This will permanently delete the collection "{collection.collectionName}" and all its files.
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
                          <span>Delete Collection</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Section */}
            {selectedFile && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FaUpload className="w-5 h-5 text-green-600" />
                  <span>Upload File</span>
                </h3>
                
                <div className="space-y-4">
                  {/* Selected File Info */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FaFile className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">{selectedFile.name}</p>
                          <p className="text-sm text-green-600">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClearFile}
                        disabled={isUploading}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* File Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Name
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      disabled={isUploading}
                      placeholder="Enter file name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Upload Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleClearFile}
                      disabled={isUploading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadSubmit}
                      disabled={!fileName.trim() || isUploading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FaUpload className="w-4 h-4" />
                          <span>Upload File</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Files Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Files</h2>
                <span className="text-sm text-gray-500">
                  {collection.fileCount || 0} files total
                </span>
              </div>

              {collection.files && collection.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collection.files.map((file) => (
                    <div 
                      key={file.id}
                      onClick={() => navigate(`/file/${file.id}`)}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <FaFile className="w-8 h-8 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {file.fileName || file.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                  <p className="text-gray-500 mb-6">Upload your first file to get started</p>
                  <button 
                    onClick={handleFileUpload}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto"
                  >
                    <FaUpload className="w-4 h-4" />
                    <span>Upload File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
    );
}

export default CollectionItem