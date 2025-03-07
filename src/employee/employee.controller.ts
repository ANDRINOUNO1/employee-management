import express from "express";
import multer from "multer";
import csvParser from "csv-parser";
import { AppDataSource } from "../data-source"; // Your TypeORM data source
import { Employees } from "../employee/employee.service";
import { Department } from "../entities/Department";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploaded files

router.post("/api/employees/bulk", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const employees: Employees[] = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", async (row) => {
            const { name, position, departmentId, hireDate } = row;

            // Check if department exists
            const department = await AppDataSource.getRepository(Department).findOne({
                where: { id: parseInt(departmentId) }
            });

            if (!department) {
                console.log(Department ID ${departmentId} not found. Skipping record.);
                return;
            }

            // Create new employee instance
            const employee = new Employee();
            employee.name = name;
            employee.position = position;
            employee.department = department;
            employee.hireDate = new Date(hireDate);
            employees.push(employee);
        })
        .on("end", async () => {
            // Save all valid employees in the database
            await AppDataSource.getRepository(Employee).save(employees);
            fs.unlinkSync(filePath); // Delete uploaded CSV file after processing
            res.json({ message: "Bulk import completed", count: employees.length });
        })
        .on("error", (error) => {
            console.error(error);
            res.status(500).json({ message: "Error processing file" });
        });
});

export default router;