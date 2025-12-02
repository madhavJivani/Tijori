import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { testUsers, testCollections, createMockReq, createMockRes } from '../fixtures/testData.js';

// Mock the database
const mockPrisma = {
  collection: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  file: {
    count: jest.fn()
  }
};

jest.unstable_mockModule('../../utils/db.js', () => ({
  default: mockPrisma
}));

// Import controller after mocking
const { 
  createCollection, 
  getAllCollections, 
  getCollection, 
  renameCollection, 
  deleteCollection 
} = await import('../../controllers/collection.controller.js');

describe('Collection Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCollection', () => {
    test('should create a new collection successfully', async () => {
      // Arrange
      const req = createMockReq({
        body: { collectionName: 'My Test Collection' },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      const expectedSlug = 'My Test Collection:_:' + testUsers.validUser1.id;
      const newCollection = {
        id: 'collection-new-123',
        collectionName: 'My Test Collection',
        slug: expectedSlug,
        ownerId: testUsers.validUser1.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock database responses
      mockPrisma.collection.findUnique.mockResolvedValue(null); // No existing collection
      mockPrisma.collection.create.mockResolvedValue(newCollection);

      // Act
      await createCollection(req, res);

      // Assert
      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { slug: expectedSlug }
      });
      expect(mockPrisma.collection.create).toHaveBeenCalledWith({
        data: {
          collectionName: 'My Test Collection',
          ownerId: testUsers.validUser1.id,
          slug: expectedSlug
        }
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection created successfully',
        collection: newCollection
      });
    });

    test('should return error if collection name is missing', async () => {
      // Arrange
      const req = createMockReq({
        body: {}, // Missing collectionName
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      // Act
      await createCollection(req, res);

      // Assert
      expect(mockPrisma.collection.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.collection.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection name is required.'
      });
    });

    test('should return error if collection already exists', async () => {
      // Arrange
      const req = createMockReq({
        body: { collectionName: 'Existing Collection' },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      const existingCollection = {
        id: 'existing-123',
        collectionName: 'Existing Collection',
        ownerId: testUsers.validUser1.id
      };

      // Mock existing collection
      mockPrisma.collection.findUnique.mockResolvedValue(existingCollection);

      // Act
      await createCollection(req, res);

      // Assert
      expect(mockPrisma.collection.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection with this name already exists.'
      });
    });

    test('should handle database errors during creation', async () => {
      // Arrange
      const req = createMockReq({
        body: { collectionName: 'Test Collection' },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      // Mock console.error to suppress output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock successful findUnique but error in create
      mockPrisma.collection.findUnique.mockResolvedValue(null); // No existing collection
      mockPrisma.collection.create.mockRejectedValue(new Error('Database error'));

      // Act
      await createCollection(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('getAllCollections', () => {
    test('should return user collections with default pagination', async () => {
      // Arrange
      const req = createMockReq({
        user: { userId: testUsers.validUser1.id },
        query: {} // No query parameters, use defaults
      });
      const res = createMockRes();

      const mockCollections = [
        {
          id: 'collection-1',
          collectionName: 'Collection 1',
          createdAt: new Date('2024-01-02')
        },
        {
          id: 'collection-2',
          collectionName: 'Collection 2',
          createdAt: new Date('2024-01-01')
        }
      ];

      mockPrisma.collection.findMany.mockResolvedValue(mockCollections);

      // Act
      await getAllCollections(req, res);

      // Assert
      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        where: { ownerId: testUsers.validUser1.id }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        info: {
          page: 1,
          qty: 20,
          order: 'desc'
        },
        count: {
          total: 2,
          current: 2
        },
        collections: expect.any(Array)
      });
    });

    test('should return collections with custom pagination and sorting', async () => {
      // Arrange
      const req = createMockReq({
        user: { userId: testUsers.validUser1.id },
        query: {
          order: 'asc',
          qty: '5',
          page: '2'
        }
      });
      const res = createMockRes();

      const mockCollections = Array.from({ length: 10 }, (_, i) => ({
        id: `collection-${i}`,
        collectionName: `Collection ${i}`,
        createdAt: new Date(`2024-01-0${i + 1}`)
      }));

      mockPrisma.collection.findMany.mockResolvedValue(mockCollections);

      // Act
      await getAllCollections(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        info: {
          page: 2,
          qty: 5,
          order: 'asc'
        },
        count: {
          total: 10,
          current: 5 // Second page with 5 items
        },
        collections: expect.any(Array)
      });
    });

    test('should handle database errors during fetch', async () => {
      // Arrange
      const req = createMockReq({
        user: { userId: testUsers.validUser1.id },
        query: {}
      });
      const res = createMockRes();

      // Mock console.error to suppress output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockPrisma.collection.findMany.mockRejectedValue(new Error('Database error'));

      // Act
      await getAllCollections(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('getCollection', () => {
    test('should return collection details with file count', async () => {
      // Arrange
      const req = createMockReq({
        body: { collectionId: testCollections.collection1.id },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      const mockCollection = {
        id: testCollections.collection1.id,
        collectionName: testCollections.collection1.collectionName,
        ownerId: testUsers.validUser1.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [
          { id: 'file-1', fileName: 'file1.pdf' },
          { id: 'file-2', fileName: 'file2.jpg' }
        ]
      };

      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection);

      // Act
      await getCollection(req, res);

      // Assert
      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: testCollections.collection1.id },
        select: {
          id: true,
          collectionName: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
          files: {
            select: { id: true, fileName: true }
          }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        collection: mockCollection,
        fileCount: 2
      });
    });

    test('should return 404 for non-existent collection', async () => {
      // Arrange
      const req = createMockReq({
        body: { collectionId: 'non-existent-id' },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      mockPrisma.collection.findUnique.mockResolvedValue(null);

      // Act
      await getCollection(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection not found or access denied.'
      });
    });

    test('should return 404 for unauthorized access', async () => {
      // Arrange
      const req = createMockReq({
        body: { collectionId: testCollections.collection1.id },
        user: { userId: 'different-user-id' }
      });
      const res = createMockRes();

      const mockCollection = {
        id: testCollections.collection1.id,
        ownerId: testUsers.validUser1.id // Different owner
      };

      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection);

      // Act
      await getCollection(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection not found or access denied.'
      });
    });
  });

  describe('renameCollection', () => {
    test('should rename collection successfully', async () => {
      // Arrange
      const req = createMockReq({
        query: {
          collectionId: testCollections.collection1.id,
          newCollectionName: 'Renamed Collection'
        },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      const existingCollection = {
        id: testCollections.collection1.id,
        ownerId: testUsers.validUser1.id,
        collectionName: 'Old Name'
      };

      const updatedCollection = {
        ...existingCollection,
        collectionName: 'Renamed Collection',
        slug: 'Renamed Collection:_:' + testUsers.validUser1.id
      };

      mockPrisma.collection.findUnique
        .mockResolvedValueOnce(existingCollection) // First call: check ownership
        .mockResolvedValueOnce(null); // Second call: check new name doesn't exist
      mockPrisma.collection.update.mockResolvedValue(updatedCollection);

      // Act
      await renameCollection(req, res);

      // Assert
      expect(mockPrisma.collection.update).toHaveBeenCalledWith({
        where: { id: testCollections.collection1.id },
        data: {
          collectionName: 'Renamed Collection',
          slug: 'Renamed Collection:_:' + testUsers.validUser1.id
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection renamed successfully',
        collection: updatedCollection
      });
    });

    test('should return error if required parameters are missing', async () => {
      // Arrange
      const req = createMockReq({
        query: { collectionId: testCollections.collection1.id }, // Missing newCollectionName
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      // Act
      await renameCollection(req, res);

      // Assert
      expect(mockPrisma.collection.findUnique).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection ID and new name are required.'
      });
    });

    test('should return error if new name already exists', async () => {
      // Arrange
      const req = createMockReq({
        query: {
          collectionId: testCollections.collection1.id,
          newCollectionName: 'Existing Name'
        },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      const existingCollection = {
        id: testCollections.collection1.id,
        ownerId: testUsers.validUser1.id
      };

      const conflictingCollection = {
        id: 'different-id',
        ownerId: testUsers.validUser1.id
      };

      mockPrisma.collection.findUnique
        .mockResolvedValueOnce(existingCollection) // First call: check ownership
        .mockResolvedValueOnce(conflictingCollection); // Second call: name conflict

      // Act
      await renameCollection(req, res);

      // Assert
      expect(mockPrisma.collection.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Another collection with this name already exists.'
      });
    });
  });

  describe('deleteCollection', () => {
    test('should delete collection successfully', async () => {
      // Arrange
      const req = createMockReq({
        query: { collectionId: testCollections.collection1.id },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      const existingCollection = {
        id: testCollections.collection1.id,
        ownerId: testUsers.validUser1.id
      };

      mockPrisma.collection.findUnique.mockResolvedValue(existingCollection);
      mockPrisma.collection.delete.mockResolvedValue(existingCollection);

      // Act
      await deleteCollection(req, res);

      // Assert
      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: testCollections.collection1.id }
      });
      expect(mockPrisma.collection.delete).toHaveBeenCalledWith({
        where: { id: testCollections.collection1.id }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection deleted successfully'
      });
    });

    test('should return 404 for unauthorized deletion', async () => {
      // Arrange
      const req = createMockReq({
        query: { collectionId: testCollections.collection1.id },
        user: { userId: 'different-user-id' }
      });
      const res = createMockRes();

      const existingCollection = {
        id: testCollections.collection1.id,
        ownerId: testUsers.validUser1.id // Different owner
      };

      mockPrisma.collection.findUnique.mockResolvedValue(existingCollection);

      // Act
      await deleteCollection(req, res);

      // Assert
      expect(mockPrisma.collection.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Collection not found or access denied.'
      });
    });

    test('should handle database errors during deletion', async () => {
      // Arrange
      const req = createMockReq({
        query: { collectionId: testCollections.collection1.id },
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      // Mock console.error to suppress output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockPrisma.collection.findUnique.mockRejectedValue(new Error('Database error'));

      // Act
      await deleteCollection(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });

      // Cleanup
      consoleSpy.mockRestore();
    });
  });
});
