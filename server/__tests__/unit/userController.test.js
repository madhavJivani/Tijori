import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import crypto from 'crypto';
import { testUsers, createMockReq, createMockRes } from '../fixtures/testData.js';

// We'll mock the database to avoid needing a real database for unit tests
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  },
  collection: {
    count: jest.fn()
  },
  file: {
    count: jest.fn()
  }
};

// Mock the database import
jest.unstable_mockModule('../../utils/db.js', () => ({
  default: mockPrisma
}));

// Mock the middleware functions
const mockGenerateTokenForUser = jest.fn();
const mockCookieOptions = { httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 3600000 };

jest.unstable_mockModule('../../utils/middleware.js', () => ({
  generateTokenForUser: mockGenerateTokenForUser,
  cookieOptions: mockCookieOptions
}));

// Now import the controller after mocking the dependencies
const { registerUser, getUserProfile, loginUser, logoutUser } = await import('../../controllers/user.controller.js');

describe('User Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockGenerateTokenForUser.mockReturnValue('mock-jwt-token-12345');
  });

  describe('registerUser', () => {
    test('should register a new user successfully', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: testUsers.validUser1.email,
          username: testUsers.validUser1.username,
          password: testUsers.validUser1.password
        }
      });
      const res = createMockRes();

      // Mock database responses
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrisma.user.create.mockResolvedValue({
        id: testUsers.validUser1.id,
        email: testUsers.validUser1.email,
        username: testUsers.validUser1.username,
        password: crypto.createHash('sha256').update(testUsers.validUser1.password).digest('hex')
      });

      // Act
      await registerUser(req, res);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUsers.validUser1.email }
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: testUsers.validUser1.email,
          username: testUsers.validUser1.username,
          password: crypto.createHash('sha256').update(testUsers.validUser1.password).digest('hex')
        }
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: expect.objectContaining({
          email: testUsers.validUser1.email,
          username: testUsers.validUser1.username
        })
      });
    });

    test('should return error if user already exists', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: testUsers.validUser1.email,
          username: testUsers.validUser1.username,
          password: testUsers.validUser1.password
        }
      });
      const res = createMockRes();

      // Mock database to return existing user
      mockPrisma.user.findUnique.mockResolvedValue(testUsers.validUser1);

      // Act
      await registerUser(req, res);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUsers.validUser1.email }
      });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User with this email already exists.'
      });
    });

    test('should return error if required fields are missing', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: testUsers.validUser1.email
          // Missing username and password
        }
      });
      const res = createMockRes();

      // Act
      await registerUser(req, res);

      // Assert
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email, username, and password are required.'
      });
    });

    test('should handle database errors gracefully', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: testUsers.validUser1.email,
          username: testUsers.validUser1.username,
          password: testUsers.validUser1.password
        }
      });
      const res = createMockRes();

      // Mock console.error to suppress output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock database to throw error
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('loginUser', () => {
    test('should login user successfully with valid credentials', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: testUsers.validUser1.email,
          password: testUsers.validUser1.password
        }
      });
      const res = createMockRes();

      // Mock user exists with hashed password
      const hashedPassword = crypto.createHash('sha256').update(testUsers.validUser1.password).digest('hex');
      mockPrisma.user.findUnique.mockResolvedValue({
        ...testUsers.validUser1,
        password: hashedPassword
      });

      // Act
      await loginUser(req, res);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUsers.validUser1.email }
      });
      expect(mockGenerateTokenForUser).toHaveBeenCalledWith({
        ...testUsers.validUser1,
        password: hashedPassword
      });
      expect(res.cookie).toHaveBeenCalledWith('auth_token', 'mock-jwt-token-12345', mockCookieOptions);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'mock-jwt-token-12345'
      });
    });

    test('should return error for non-existent email', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: 'nonexistent@example.com',
          password: 'somepassword'
        }
      });
      const res = createMockRes();

      // Mock user not found
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      await loginUser(req, res);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      });
      expect(mockGenerateTokenForUser).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid email'
      });
    });

    test('should return error for incorrect password', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: testUsers.validUser1.email,
          password: 'wrongpassword'
        }
      });
      const res = createMockRes();

      // Mock user exists with different password
      const correctHashedPassword = crypto.createHash('sha256').update(testUsers.validUser1.password).digest('hex');
      mockPrisma.user.findUnique.mockResolvedValue({
        ...testUsers.validUser1,
        password: correctHashedPassword
      });

      // Act
      await loginUser(req, res);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUsers.validUser1.email }
      });
      expect(mockGenerateTokenForUser).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid password.'
      });
    });

    test('should return error when email is missing', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          password: testUsers.validUser1.password
        }
      });
      const res = createMockRes();

      // Act
      await loginUser(req, res);

      // Assert
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email and password are required.'
      });
    });

    test('should return error when password is missing', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: testUsers.validUser1.email
        }
      });
      const res = createMockRes();

      // Act
      await loginUser(req, res);

      // Assert
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email and password are required.'
      });
    });

    test('should handle database errors during login', async () => {
      // Arrange
      const req = createMockReq({
        body: {
          email: testUsers.validUser1.email,
          password: testUsers.validUser1.password
        }
      });
      const res = createMockRes();

      // Mock console.error to suppress output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock database error
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database timeout'));

      // Act
      await loginUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('logoutUser', () => {
    test('should logout user successfully', async () => {
      // Arrange
      const req = createMockReq();
      const res = createMockRes();

      // Act
      await logoutUser(req, res);

      // Assert
      expect(res.clearCookie).toHaveBeenCalledWith('auth_token', {
        httpOnly: true,
        secure: false, // NODE_ENV !== 'production'
        sameSite: 'Lax',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logout successful'
      });
    });

    test('should handle errors during logout gracefully', async () => {
      // Arrange
      const req = createMockReq();
      const res = createMockRes();

      // Mock console.error to suppress output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock clearCookie to throw error
      res.clearCookie.mockImplementation(() => {
        throw new Error('Cookie clearing failed');
      });

      // Act
      await logoutUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('getUserProfile', () => {
    test('should return user profile with counts', async () => {
      // Arrange
      const req = createMockReq({
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      // Mock database responses
      mockPrisma.collection.count.mockResolvedValue(3);
      mockPrisma.file.count.mockResolvedValue(5);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUsers.validUser1.id,
        username: testUsers.validUser1.username,
        email: testUsers.validUser1.email,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act
      await getUserProfile(req, res);

      // Assert
      expect(mockPrisma.collection.count).toHaveBeenCalledWith({
        where: { ownerId: testUsers.validUser1.id }
      });
      expect(mockPrisma.file.count).toHaveBeenCalledWith({
        where: { ownerId: testUsers.validUser1.id }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        collectionCount: 3,
        fileCount: 5,
        user: expect.objectContaining({
          id: testUsers.validUser1.id,
          username: testUsers.validUser1.username,
          email: testUsers.validUser1.email
        })
      });
    });

    test('should return 404 when user not found', async () => {
      // Arrange
      const req = createMockReq({
        user: { userId: 'non-existent-user-id' }
      });
      const res = createMockRes();

      // Mock database responses
      mockPrisma.collection.count.mockResolvedValue(0);
      mockPrisma.file.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue(null); // User not found

      // Act
      await getUserProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found.'
      });
    });

    test('should handle database errors during profile fetch', async () => {
      // Arrange
      const req = createMockReq({
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      // Mock console.error to suppress output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock database error in user.findUnique (which happens after the counts)
      mockPrisma.collection.count.mockResolvedValue(3);
      mockPrisma.file.count.mockResolvedValue(5);
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      // Act
      await getUserProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });

      // Cleanup
      consoleSpy.mockRestore();
    });

    test('should return profile with zero counts for new user', async () => {
      // Arrange
      const req = createMockReq({
        user: { userId: testUsers.validUser1.id }
      });
      const res = createMockRes();

      // Mock database responses for new user
      mockPrisma.collection.count.mockResolvedValue(0);
      mockPrisma.file.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUsers.validUser1.id,
        username: testUsers.validUser1.username,
        email: testUsers.validUser1.email,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act
      await getUserProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        collectionCount: 0,
        fileCount: 0,
        user: expect.objectContaining({
          id: testUsers.validUser1.id,
          username: testUsers.validUser1.username,
          email: testUsers.validUser1.email
        })
      });
    });
  });
});
