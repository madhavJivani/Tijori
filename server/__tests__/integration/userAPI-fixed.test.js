import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { testUsers } from '../fixtures/testData.js';
import { mockPrismaClient, resetMocks, mockAuthMiddleware, integrationTestData } from '../fixtures/integrationSetup.js';

// Mock all external dependencies BEFORE importing the app
jest.unstable_mockModule('../../utils/db.js', () => ({
  default: mockPrismaClient
}));

jest.unstable_mockModule('../../utils/middleware.js', () => mockAuthMiddleware);

// Mock AWS S3 to prevent external calls
jest.unstable_mockModule('../../utils/aws-s3.js', () => ({
  uploadFileToS3: jest.fn().mockResolvedValue('mock-s3-key'),
  getFileFromS3: jest.fn().mockResolvedValue('mock-s3-url'),
  getDownloadUrlFromS3: jest.fn().mockResolvedValue('mock-download-url')
}));

// Now import the app after all mocks are set up
const { default: app } = await import('../../app.js');

describe('User API Integration Tests - Fixed Version', () => {
  let server;

  beforeAll(async () => {
    // Start server on random port
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    jest.clearAllMocks();
    
    // Set default mock implementations
    mockAuthMiddleware.generateTokenForUser.mockReturnValue('mock-jwt-token-12345');
  });

  describe('POST /api/users/register', () => {
    test('should register a new user successfully', async () => {
      // Setup mocks
      mockPrismaClient.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrismaClient.user.create.mockResolvedValue(integrationTestData.user);

      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: integrationTestData.user.email,
          username: integrationTestData.user.username,
          password: 'plainpassword123'
        })
        .expect(201);

      expect(response.body).toEqual({
        message: 'User registered successfully',
        user: expect.objectContaining({
          id: integrationTestData.user.id,
          email: integrationTestData.user.email,
          username: integrationTestData.user.username
        })
      });

      // Verify mock calls
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: integrationTestData.user.email }
      });
      expect(mockPrismaClient.user.create).toHaveBeenCalled();
    });

    test('should return 409 for duplicate email', async () => {
      // Setup mocks - user already exists
      mockPrismaClient.user.findUnique.mockResolvedValue(integrationTestData.user);

      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: integrationTestData.user.email,
          username: 'differentusername',
          password: 'password123'
        })
        .expect(409);

      expect(response.body).toEqual({
        message: 'User with this email already exists.'
      });
    });

    test('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: integrationTestData.user.email
          // Missing username and password
        })
        .expect(400);

      expect(response.body).toEqual({
        message: 'Email, username, and password are required.'
      });
    });
  });

  describe('POST /api/users/login', () => {
    test('should login successfully with valid credentials', async () => {
      // Setup mocks
      const hashedPassword = crypto.createHash('sha256').update('plainpassword123').digest('hex');
      mockPrismaClient.user.findUnique.mockResolvedValue({
        ...integrationTestData.user,
        password: hashedPassword
      });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: integrationTestData.user.email,
          password: 'plainpassword123'
        })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Login successful',
        token: 'mock-jwt-token-12345'
      });

      // Check that auth cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.startsWith('auth_token='))).toBe(true);
    });

    test('should return 401 for invalid credentials', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toEqual({
        message: 'Invalid email'
      });
    });
  });

  describe('GET /api/users/profile', () => {
    test('should return user profile when authenticated', async () => {
      // Setup mocks
      mockPrismaClient.collection.count.mockResolvedValue(3);
      mockPrismaClient.file.count.mockResolvedValue(7);
      mockPrismaClient.user.findUnique.mockResolvedValue(integrationTestData.user);

      // Create valid JWT token
      const authToken = jwt.sign(
        { userId: integrationTestData.user.id, email: integrationTestData.user.email },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/users/profile')
        .set('Cookie', `auth_token=${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        collectionCount: 3,
        fileCount: 7,
        user: expect.objectContaining({
          id: integrationTestData.user.id,
          username: integrationTestData.user.username,
          email: integrationTestData.user.email
        })
      });
    });

    test('should return 401 without authentication', async () => {
      // Temporarily override the mock to simulate no authentication
      mockAuthMiddleware.authenticateToken.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Access token is missing' });
      });

      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toEqual({
        message: 'Access token is missing'
      });
    });
  });

  describe('POST /api/users/logout', () => {
    test('should logout successfully', async () => {
      const authToken = jwt.sign(
        { userId: integrationTestData.user.id, email: integrationTestData.user.email },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/users/logout')
        .set('Cookie', `auth_token=${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Logout successful'
      });
    });
  });

  describe('Health Check', () => {
    test('should return server health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        service: 'Personal File Vault API'
      });
    });
  });

  describe('CORS Configuration', () => {
    test('should support local development CORS', async () => {
      const response = await request(app)
        .options('/api/users/register')
        .set('Origin', 'http://localhost:5173')
        .expect(204);

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    test('should support production frontend CORS', async () => {
      const response = await request(app)
        .options('/api/users/register')
        .set('Origin', 'http://tijori.frontend.madhav.jivani.s3-website.ap-south-1.amazonaws.com')
        .expect(204);

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});
