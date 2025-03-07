import { Request, Response, NextFunction } from 'express';


export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = typeof err === 'string' && err.toLowerCase().includes('not found') ? 404 : 500;
    res.status(statusCode).json({ message: err.message || err });
};


