// Test environment configuration for isolated testing
import { jest } from '@jest/globals';

// Create a completely mocked Prisma client for integration tests
export const createMockPrismaClient = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  collection: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  file: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn((fn) => fn(mockPrismaClient))
});

export const mockPrismaClient = createMockPrismaClient();

// Reset all mocks
export const resetMocks = () => {
  Object.values(mockPrismaClient).forEach(table => {
    if (typeof table === 'object' && table !== null) {
      Object.values(table).forEach(method => {
        if (typeof method?.mockReset === 'function') {
          method.mockReset();
        }
      });
    }
  });
};

// Mock authentication middleware for integration tests
export const mockAuthMiddleware = {
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 'test-user-123', email: 'test@example.com' };
    next();
  }),
  isUserLoggedOut: jest.fn((req, res, next) => next()),
  generateTokenForUser: jest.fn(() => 'mock-jwt-token-12345'),
  cookieOptions: { 
    httpOnly: true, 
    secure: false, 
    sameSite: 'Lax', 
    maxAge: 3600000 
  }
};

// Test data for consistent testing across integration tests
export const integrationTestData = {
  user: {
    id: 'test-user-123',
    username: 'testuser',
    email: 'test@example.com', 
    password: 'hashedpassword123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  collection: {
    id: 'test-collection-123',
    collectionName: 'Test Collection',
    ownerId: 'test-user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
};
