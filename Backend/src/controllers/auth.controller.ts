import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

const updateProfileSchema = z.object({
    name: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
});

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ success: false, message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.status(201).json({ success: true, message: 'Registration successful', userId: user.id });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        res.json({ success: true, accessToken, refreshToken });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(401).json({ success: false, message: 'Refresh token required' });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
        const accessToken = generateAccessToken(decoded.userId);
        res.json({ success: true, accessToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    // In a real app we'd blacklist the token. Here, we just ask client to clear it.
    res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId!;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, user: { name: user.name, email: user.email } });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId!;
        const { name, password } = updateProfileSchema.parse(req.body);
        const data: any = {};
        if (name) data.name = name;
        if (password) data.password = await bcrypt.hash(password, 10);

        if (Object.keys(data).length === 0) {
            res.json({ success: true, message: 'No changes provided' });
            return;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data
        });

        res.json({ success: true, message: 'Profile updated', user: { name: user.name, email: user.email } });
    } catch (error) {
        next(error);
    }
};
