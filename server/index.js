import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './utils/db.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

// Function to start the server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📤 Shutting down server...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n📤 Shutting down server...');
  await disconnectDB();
  process.exit(0);
});

// Start the server
startServer();
