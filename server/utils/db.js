import pkg from '../generated/prisma/index.js';
const { PrismaClient } = pkg;

// Create a single instance of PrismaClient to be reused across the application
let prisma;

// Function to get the Prisma client instance
const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      // log: ['query', 'info', 'warn', 'error'], // Enable logging in development
    });
  }
  return prisma;
};

// Function to connect to the database
const connectDB = async () => {
  try {
    const client = getPrismaClient();
    await client.$connect();
    console.log('✅ Connected to PostgreSQL database successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

// Function to disconnect from the database
const disconnectDB = async () => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log('✅ Disconnected from database');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};

// Export the functions and the prisma instance
export { connectDB, disconnectDB, getPrismaClient };
export default getPrismaClient();

