import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './helpers/db';
import employeeRouter from './employee/employee.controller';
import errorHandler from './middleware/error.handler';

const app = express();
app.use(express.json());
app.use(cors());
app.use(employeeRouter);
app.use(errorHandler);

const port = process.env.PORT || 4000;

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