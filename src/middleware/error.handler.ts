import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const statusCode = typeof err === 'string' && err.toLowerCase().endsWith('not found') ? 404 : 500;
    res.status(statusCode).json({ message: err.message || err });
}