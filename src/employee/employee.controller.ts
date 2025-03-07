import express from "express";
import multer from "multer";
import csvParser from "csv-parser";
import { AppDataSource } from "../data-source"; // TypeORM data source
import { Employee } from "../employee/employee.entity";
import { Department } from "../employee/employee.entity"; // Correct import
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploaded files

router.post("/api/employees/bulk", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const employees: Employee[] = [];
    const filePath = req.file.path;
    const employeeRepository = AppDataSource.getRepository(Employee);
    const departmentRepository = AppDataSource.getRepository(Department);

    const fileStream = fs.createReadStream(filePath);

    fileStream
        .pipe(csvParser())
        .on("data", (row) => {
            employees.push(row);
        })
        .on("end", async () => {
            try {
                const validEmployees: Employee[] = [];

                for (const row of employees) {
                    const { name, position, departmentId: rawDeptId, hireDate } = row;

                    // Convert departmentId to a number
                    const departmentId = parseInt(rawDeptId, 10);
                    if (isNaN(departmentId)) {
                        console.log(`Skipping row: invalid departmentId ${rawDeptId}`);
                        continue;
                    }

                    // Fetch department
                    const department = await departmentRepository.findOne({
                        where: { id: departmentId }
                    });

                    if (!department) {
                        console.log(`Department ID ${departmentId} not found. Skipping record.`);
                        continue;
                    }

                    // Validate and convert hireDate
                    const parsedHireDate = hireDate ? new Date(hireDate) : new Date();
                    if (isNaN(parsedHireDate.getTime())) {
                        console.log(`Skipping row: invalid hireDate ${hireDate}`);
                        continue;
                    }

                    // Create Employee instance
                    const employee = new Employee();
                    employee.name = name;
                    employee.position = position;
                    employee.department = department;
                    employee.hireDate = parsedHireDate;

                    validEmployees.push(employee);
                }

                if (validEmployees.length > 0) {
                    await employeeRepository.save(validEmployees);
                }

                fs.unlinkSync(filePath);
                res.json({ message: "Bulk import completed", count: validEmployees.length });

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Error processing file" });
            }
        })
        .on("error", (error) => {
            console.error(error);
            res.status(500).json({ message: "Error reading file" });
        });
});

export default router;
