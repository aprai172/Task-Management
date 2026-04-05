import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';

const taskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
});

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId!;
        const { status, search, page = '1', limit = '10' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);

        let whereClause: any = { userId };

        if (status !== undefined) {
            whereClause.status = status === 'true';
        }

        if (search) {
            whereClause.title = { contains: search as string, mode: 'insensitive' };
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { id: 'desc' } // or any other ordering
        });

        const total = await prisma.task.count({ where: whereClause });

        res.json({
            success: true,
            data: tasks,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        next(error);
    }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId!;
        const { title, description } = taskSchema.parse(req.body);

        const task = await prisma.task.create({
            data: { title, description, userId }
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId!;
        const { id } = req.params as { id: string };

        const task = await prisma.task.findFirst({ where: { id, userId } });
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }

        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId!;
        const { id } = req.params as { id: string };
        const { title, description, status } = req.body;

        const existing = await prisma.task.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }

        const task = await prisma.task.update({
            where: { id },
            data: { title, description, status }
        });

        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId!;
        const { id } = req.params as { id: string };

        const existing = await prisma.task.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }

        await prisma.task.delete({ where: { id } });

        res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
        next(error);
    }
};

export const toggleTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId!;
        const { id } = req.params as { id: string };

        const existing = await prisma.task.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }

        const task = await prisma.task.update({
            where: { id },
            data: { status: !existing.status }
        });

        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};
