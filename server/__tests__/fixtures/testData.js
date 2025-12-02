// Test data fixtures for consistent testing
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

export const testUsers = {
  validUser1: {
    id: 'user-123-test',
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'password123'
  },
  validUser2: {
    id: 'user-456-test',
    username: 'testuser2', 
    email: 'test2@example.com',
    password: 'password456'
  },
  invalidUser: {
    username: 'invalid',
    email: 'invalid-email',
    password: '123'
  }
};

export const testCollections = {
  collection1: {
    id: 'collection-123-test',
    collectionName: 'Test Collection 1',
    slug: 'Test Collection 1:_:user-123-test',
    ownerId: 'user-123-test'
  },
  collection2: {
    id: 'collection-456-test',
    collectionName: 'Test Collection 2', 
    slug: 'Test Collection 2:_:user-123-test',
    ownerId: 'user-123-test'
  }
};

export const testFiles = {
  file1: {
    id: 'file-123-test',
    fileName: 'test-document.pdf',
    filePath: 'user-123-test/1234567890-test-document.pdf',
    ownerId: 'user-123-test'
  },
  file2: {
    id: 'file-456-test',
    fileName: 'test-image.jpg',
    filePath: 'user-123-test/1234567891-test-image.jpg', 
    ownerId: 'user-123-test'
  }
};

// Helper function to generate test JWT tokens
export const generateTestToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: '1h' }
  );
};

// Mock request/response objects for testing
export const createMockReq = (overrides = {}) => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  cookies: {},
  user: null,
  files: null,
  ...overrides
});

export const createMockRes = () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
    cookie: jest.fn(() => res),
    clearCookie: jest.fn(() => res),
    send: jest.fn(() => res)
  };
  return res;
};
