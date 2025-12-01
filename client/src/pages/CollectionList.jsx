import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaFolder, 
  FaPlus, 
  FaSearch, 
  FaCalendarAlt,
  FaFile,
  FaFilter,
  FaSort,
  FaTh,
  FaList
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useUserStore } from '../store';
import useCollectionStore from '../store/useCollectionStore';

const CollectionList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const { 
    collections, 
    loading, 
    error, 
    createCollection, 
    fetchCollections,
    hasMoreCollections,
    loadMoreCollections 
  } = useCollectionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch collections on mount and when sort order changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections({ order: sortOrder });
    }
  }, [isAuthenticated, sortOrder, fetchCollections]);

  // Filter collections based on search query
  const filteredCollections = collections.filter(collection =>
    collection.collectionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle show create form
  const handleShowCreateForm = () => {
    setShowCreateForm(true);
  };

  // Handle create collection submission
  const handleCreateSubmit = async () => {
    if (!collectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading('Creating collection...');

    try {
      await createCollection(collectionName.trim());
      toast.success('Collection created successfully!', { id: loadingToast });

      // Reset form
      setCollectionName('');
      setShowCreateForm(false);

    } catch (error) {
      console.error('Failed to create collection:', error);
      toast.error('Failed to create collection. Please try again.', { id: loadingToast });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle cancel create
  const handleCancelCreate = () => {
    setCollectionName('');
    setShowCreateForm(false);
  };

  // Handle load more collections
  const handleLoadMore = async () => {
    try {
      await loadMoreCollections();
    } catch (error) {
      toast.error('Failed to load more collections');
    }
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

  // Loading state
  if (loading && collections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading collections...</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Collections</h1>
              <p className="text-gray-600">
                {filteredCollections.length} of {collections.length} collections
              </p>
            </div>
            
            <button
              onClick={handleShowCreateForm}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <FaPlus className="w-4 h-4" />
              <span>Create Collection</span>
            </button>
          </div>
        </div>

        {/* Collection Creation Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FaPlus className="w-5 h-5 text-blue-600" />
              <span>Create New Collection</span>
            </h3>

            <div className="space-y-4">
              {/* Collection Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  disabled={isCreating}
                  placeholder="Enter collection name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isCreating) {
                      handleCreateSubmit();
                    }
                  }}
                />
              </div>

              {/* Creation Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelCreate}
                  disabled={isCreating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubmit}
                  disabled={!collectionName.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FaPlus className="w-4 h-4" />
                      <span>Create Collection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-l-lg transition`}
              >
                <FaTh className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-r-lg transition`}
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

        {/* Collections Grid/List */}
        {filteredCollections.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCollections.map((collection) => (
                  <div
                    key={collection.id}
                    onClick={() => navigate(`/collection/${collection.id}`)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="text-center">
                      <FaFolder className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:text-blue-600 transition-colors" />
                      <h3 className="font-semibold text-gray-900 mb-2 truncate">
                        {collection.collectionName}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center justify-center space-x-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>{formatDate(collection.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-2">
                {filteredCollections.map((collection) => (
                  <div
                    key={collection.id}
                    onClick={() => navigate(`/collection/${collection.id}`)}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <FaFolder className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {collection.collectionName}
                        </h3>
                        <p className="text-sm text-gray-500">
                        Created {formatDate(collection.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Updated {formatDate(collection.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMoreCollections() && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More</span>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            {searchQuery ? (
              <>
                <FaSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No collections found
                </h3>
                <p className="text-gray-600 mb-6">
                  No collections match your search "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <FaFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No collections yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first collection to organize your files
                </p>
                <button
                  onClick={handleShowCreateForm}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto disabled:opacity-50"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Create Collection</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionList;