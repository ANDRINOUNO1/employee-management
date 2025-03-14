import express from 'express';
import cors from 'cors';
import  userRouter  from './employee/employee.controller'; // Ensure correct path
import { errorHandler } from './middleware/error.handler'; // Ensure correct path
import { initializeDatabase } from './helpers/db'; // Ensure correct path

const app = express();

app.use(express.json());
app.use(cors());
app.use('/users', userRouter);
app.use(errorHandler);

const port = process.env.PORT || 4000;

initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch((error: Error) => {  // This catch block is enough
        console.error('Server startup error:', error.message);
        process.exit(1);
    });