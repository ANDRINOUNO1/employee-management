import { Request, Response, NextFunction } from 'express';
import { Role } from '../helpers/role';
import { AppDataSource } from '../helpers/db';
import { User } from '../employee/user.entity';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: Role;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Get credentials from request body
        const { userEmail, userPassword } = req.body;

        if (!userEmail || !userPassword) {
            return res.status(401).json({ 
                message: "Authentication required", 
                required: "Include userEmail and userPassword in request body" 
            });
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { email: userEmail }
        });

        if (!user || user.password !== userPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        next(error);
    }
}; 