import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './helpers/db';
import employeeRouter from './employee/employee.controller';
import { errorHandler } from './middleware/error.handler';
import { authMiddleware } from './middleware/auth.middleware';
import { Role } from './helpers/role';
import userRouter from './user/user.controller';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/test-auth', authMiddleware, (req: any, res) => {
    res.json({ 
        message: "Auth working", 
        userRole: req.user?.role,
        userId: req.user?.id 
    });
});


app.use('/api', employeeRouter);  
app.use('/api', userRouter);


app.use(errorHandler);

const port = process.env.PORT || 4000;

// Database initialization and server start
initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch(error => {
        console.error('Server startup error:', error);
        process.exit(1);
    });