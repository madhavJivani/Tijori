import jwt from 'jsonwebtoken';
import prismaClient from './db.js';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const auth_token = req.cookies.auth_token || (authHeader && authHeader.split(' ')[1]);

    if (!auth_token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    // console.log('Token:', auth_token);

    jwt.verify(auth_token, process.env.JWT_SECRET || 'default_secret_key', async (err, user) => {
        // console.log('Error name:', err?.name);
        // console.log('User from verify:', user);
        
        if (err) {
            if (err.name === 'TokenExpiredError') {
                console.log("Token expired, attempting to refresh...");
                
                try {
                    // Decode the expired token WITHOUT verification to get user info
                    const decodedToken = jwt.decode(auth_token);
                    console.log("Decoded expired token:", decodedToken);
                    
                    if (decodedToken && decodedToken.userId) {
                        // Check if user still exists in database
                        const prisma = prismaClient;
                        const existingUser = await prisma.user.findUnique({
                            where: { id: decodedToken.userId }
                        });

                        if (existingUser) {
                            // console.log("User found in DB, generating new token for:", existingUser.email);
                            
                            // Generate new JWT token using the user data from database
                            const newToken = generateTokenForUser(existingUser);

                            // Set new cookie with refreshed token
                            res.cookie('auth_token', newToken, cookieOptions);
                            // console.log("New token issued and cookie set");
                            
                            // Set user info in request using the decoded token data
                            req.user = {
                                userId: decodedToken.userId,
                                email: decodedToken.email
                            };                            
                            return next();
                        } else {
                            console.log("User no longer exists in database ~ ", decodedToken.email);
                            return res.status(403).json({ message: 'User no longer exists' });
                        }
                    } else {
                        console.log("Cannot decode token or missing userId");
                        return res.status(403).json({ message: 'Invalid token structure' });
                    }
                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                    return res.status(403).json({ message: 'Failed to refresh token' });
                }
            } else {
                console.log("Non-expiration error: \n\n", err.name,  "\n\n", err.message);
                return res.status(403).json({ message: 'Invalid access token' });
            }
        } else {
            // Token is valid
            // console.log("Token is valid for user:", user.email);
            req.user = user;
            return next();
        }
    });
};

export const isUserLoggedOut = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const auth_token = req.cookies.auth_token || (authHeader && authHeader.split(' ')[1]);

    if (auth_token) {
        return res.status(401).json({ message: 'Already logged in.' });
    }
    next();
};

export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
// export const JWT_EXPIRES_IN = '1s' // 1 second for testing purposes;

export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 60 * 60 * 1000, // 1 hour
};

export const generateTokenForUser = (user) => {
    return jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};