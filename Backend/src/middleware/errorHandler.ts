import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof ZodError) {
        res.status(400).json({ success: false, message: 'Validation Error', errors: (err as any).errors });
        return;
    }
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, message });
};
