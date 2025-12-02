import prismaClient from '../utils/db.js';
import crypto from 'crypto';
import {cookieOptions, generateTokenForUser} from '../utils/middleware.js'


const prisma = prismaClient;

export const registerUser = async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Email, username, and password are required.' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // console.log(existingUser);
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // lets hash the password using crypto module
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const newUser = await prisma.user.create({
            data: { email, username, password: hashedPassword }
        });
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // return res.status(401).json({ message: 'Invalid email or password.' });
            return res.status(401).json({ message: 'Invalid email' });
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (user.password !== hashedPassword) {
            // return res.status(401).json({ message: 'Invalid email or password.' });
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // Generate JWT token
        const token = generateTokenForUser(user);

        res.cookie('auth_token', token, cookieOptions);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserProfile = async (req, res) => {
    const userId = req.user.userId;
    const collectionCount = await prisma.collection.count({
        where: { ownerId: userId }
    });
    const fileCount = await prisma.file.count({
        where: { ownerId: userId }
    });
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ collectionCount, fileCount, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logoutUser = (req, res) => {
    try {
        // Clear the auth_token cookie
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}