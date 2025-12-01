import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/user.routes.js';
import collectionRoutes from './routes/collection.route.js';
import fileRoutes from './routes/file.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({limit: '64kb'}));
app.use(express.static('public'));
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Personal File Vault API'
    });
});

export default app;