import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { createMockReq, createMockRes } from '../fixtures/testData.js';

// Mock the database
const mockPrisma = {
  user: {
    findUnique: jest.fn()
  }
};

jest.unstable_mockModule('../../utils/db.js', () => ({
  default: mockPrisma
}));

// Test the middleware utilities
describe('Middleware Utils', () => {
  const testUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser'
  };

  let generateTokenForUser, cookieOptions, authenticateToken;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Import the functions after mocking
    const middleware = await import('../../utils/middleware.js');
    generateTokenForUser = middleware.generateTokenForUser;
    cookieOptions = middleware.cookieOptions;
    authenticateToken = middleware.authenticateToken;
  });

  describe('generateTokenForUser', () => {
    test('should generate a valid JWT token for user', () => {
      // Act
      const token = generateTokenForUser(testUser);

      // Assert
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
      
      // Verify the token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000)); // Should have future expiration
    });

    test('should include expiration in token', () => {
      // Act
      const token = generateTokenForUser(testUser);

      // Assert
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
      
      // Token should expire in approximately 1 hour (3600 seconds)
      const expectedExp = Math.floor(Date.now() / 1000) + 3600;
      expect(decoded.exp).toBeCloseTo(expectedExp, -1); // Allow 10 seconds tolerance
    });
  });

  describe('authenticateToken', () => {
    test('should return 401 when no token is provided', async () => {
      // Arrange
      const req = createMockReq({
        headers: {},
        cookies: {}
      });
      const res = createMockRes();
      const next = jest.fn();

      // Act
      await authenticateToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access token is missing'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should authenticate valid token from cookie', async () => {
      // Arrange
      const token = generateTokenForUser(testUser);
      const req = createMockReq({
        cookies: { auth_token: token }
      });
      const res = createMockRes();
      const next = jest.fn();

      // Act
      await authenticateToken(req, res, next);

      // Assert
      expect(req.user.userId).toBe(testUser.id);
      expect(req.user.email).toBe(testUser.email);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('cookieOptions', () => {
    test('should have correct cookie configuration', () => {
      // Assert
      expect(cookieOptions).toEqual({
        httpOnly: true,
        secure: false, // NODE_ENV !== 'production' in test
        sameSite: 'Lax',
        maxAge: 3600000 // 1 hour in milliseconds
      });
    });
  });
});
