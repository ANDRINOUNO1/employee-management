import express, { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

const router = express.Router();
const userService = new UserService();


router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, title, role, employeeId } = req.body;
        
        if (!email || !password || !employeeId) {
            return res.status(400).json({ 
                message: "Email, password, and employeeId are required" 
            });
        }

        const user = await userService.create({
            email,
            password,
            title,
            role,
            employeeId
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                email: user.email,
                title: user.title,
                role: user.role,
                employeeId: user.employeeId
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            next(error);
        }
    }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userService.login(email, password);

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                title: user.title,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router; 