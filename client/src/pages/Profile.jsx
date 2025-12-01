import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaFolder,
  FaFile,
  FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useUserStore, useFileStore } from '../store';
import useCollectionStore from '../store/useCollectionStore';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { user, loading, error, isAuthenticated, fetchProfile } = useUserStore();
  const { collections, loading: collectionsLoading, createCollection } = useCollectionStore();
  const { files, loading: filesLoading } = useFileStore();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch profile if user data is missing
    if (!user && !loading) {
      fetchProfile().catch(() => {
        navigate('/login');
      });
    }
  }, [isAuthenticated, user, loading, fetchProfile, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load profile</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-inner">
                <FaUser className="w-10 h-10 text-blue-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {user.username.toUpperCase().charAt(0)+user.username.slice(1)}
                  </h1>
                  <button
                    onClick={async () => {
                      try {
                        await fetchProfile();
                        toast.success('Profile refreshed successfully!');
                      } catch (error) {
                        toast.error('Failed to refresh profile');
                      }
                    }}
                    disabled={loading}
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh profile data"
                  >
                    <FaSync className={`size-3 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-3">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3 min-w-[100px]">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.userCollectionCount || 0}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">Collections</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 min-w-[100px]">
                  <div className="text-2xl font-bold text-green-600">
                    {user.userFileCount || 0}
                  </div>
                  <div className="text-xs text-green-700 font-medium">Files</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <FaCalendarAlt className="inline-block mr-1" />
                Member since {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: FaUser },
                { id: 'collections', label: 'Collections', icon: FaFolder },
                { id: 'files', label: 'Files', icon: FaFile }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                {/* Profile Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <FaUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="font-medium text-gray-900">{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Account Created</p>
                        <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium text-gray-900">{formatDate(user.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div>
                {filesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading files...</p>
                  </div>
                ) : files.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif font-semibold text-gray-900 w-full text-3xl text-center">My Files</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <div 
                          key={file.id}
                          onClick={() => navigate(`/file/${file.id}`)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FaFile className="w-8 h-8 text-green-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {file.fileName}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  Uploaded {formatDate(file.createdAt)}
                                </p>
                                {file.updatedAt !== file.createdAt && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Updated {formatDate(file.updatedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                    <p className="text-gray-500 mb-6">Upload your first file to get started
                      Head to &nbsp;
                      <Link to="/file" className="text-blue-500 hover:underline">your files</Link>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Collections Tab */}
            {activeTab === 'collections' && (
              <div>
                {collectionsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading collections...</p>
                  </div>
                ) : collections.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif font-semibold text-gray-900 w-full text-3xl text-center">My Collections</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collections.map((collection) => (
                        <div 
                          key={collection.id} 
                          onClick={() => navigate(`/collection/${collection.id}`)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <FaFolder className="w-8 h-8 text-blue-500" />
                              <div>
                                <h4 className="font-semibold text-gray-900">{collection.collectionName}</h4>
                                <p className="text-sm text-gray-500">
                                  Created {formatDate(collection.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
                    <p className="text-gray-500 mb-6">Create your first collection to organize your files under &nbsp;
                      <Link to="/collection" className="text-blue-500 hover:underline">your collections</Link>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;