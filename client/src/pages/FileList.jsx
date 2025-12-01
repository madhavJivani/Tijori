import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaFile,
    FaPlus,
    FaSearch,
    FaCalendarAlt,
    FaDownload,
    FaFilter,
    FaSort,
    FaTh,
    FaList,
    FaUpload,
    FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useUserStore, useFileStore } from '../store';

const FileList = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUserStore();
    const {
        files,
        loading,
        error,
        fetchFiles,
        hasMoreFiles,
        loadMoreFiles,
        createFile
    } = useFileStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, navigate]);

    // Fetch files on mount and when sort order changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchFiles({ order: sortOrder });
        }
    }, [isAuthenticated, sortOrder, fetchFiles]);

    // Filter files based on search query
    const filteredFiles = files.filter(file =>
        file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            // Create file without collection (standalone file)
            await createFile({
                fileName: fileName.trim(),
                collections: [], // No collections for standalone file
                document: selectedFile
            });

            toast.success('File uploaded successfully!', { id: loadingToast });

            // Reset form
            setSelectedFile(null);
            setFileName("");

            // Refresh files list with current sort order
            fetchFiles({ order: sortOrder });

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

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format file size
    const formatFileSize = (size) => {
        if (!size) return 'N/A';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Loading state
    if (loading && files.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="text-gray-600">Loading files...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Files</h1>
                            <p className="text-gray-600">
                                {filteredFiles.length} of {files.length} files
                            </p>
                        </div>

                        <button
                            onClick={handleFileUpload}
                            disabled={loading}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
                        >
                            <FaUpload className="w-4 h-4" />
                            <span>Upload File</span>
                        </button>
                    </div>
                </div>

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
                                                {formatFileSize(selectedFile.size)}
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

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-l-lg transition`}
                            >
                                <FaTh className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-r-lg transition`}
                            >
                                <FaList className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Sort Order */}
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <FaSort className="w-4 h-4" />
                            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Files Grid/List */}
                {filteredFiles.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        {viewMode === 'grid' ? (
                            // Grid View
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        onClick={() => navigate(`/file/${file.id}`)}
                                        className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
                                    >
                                        <div className="text-center">
                                            <FaFile className="w-12 h-12 text-green-500 mx-auto mb-4 group-hover:text-green-600 transition-colors" />
                                            <h3 className="font-semibold text-gray-900 mb-2 truncate">
                                                {file.fileName}
                                            </h3>
                                            <div className="space-y-1 text-sm text-gray-500">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <FaCalendarAlt className="w-3 h-3" />
                                                    <span>{formatDate(file.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // List View
                            <div className="space-y-2">
                                {filteredFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        onClick={() => navigate(`/file/${file.id}`)}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <FaFile className="w-8 h-8 text-green-500 group-hover:text-green-600 transition-colors" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">{file.fileName}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>{formatDate(file.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <FaDownload className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Empty State
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FaFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No files found</h2>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ?
                                `No files match "${searchQuery}". Try adjusting your search.` :
                                'Upload your first file to get started.'
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleFileUpload}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto"
                            >
                                <FaUpload className="w-4 h-4" />
                                <span>Upload File</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileList;
