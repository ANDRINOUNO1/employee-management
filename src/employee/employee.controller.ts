import express from "express";
import multer from "multer";
import csvParser from "csv-parser";
import { AppDataSource } from "../helpers/db";
import { Employee } from "./employee.entity";
import { Department } from "./department.entity";
import { Employees, Departments } from "./employee.service";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const employeeService = new Employees();
const departmentService = new Departments();

// Employee routes
router.get("/employees", async (req, res, next) => {
    try {
        const employees = await employeeService.getAll();
        res.json(employees);
    } catch (error) {
        next(error);
    }
});

router.get("/employees/:id", async (req, res, next) => {
    try {
        const employee = await employeeService.getById(Number(req.params.id));
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
});

router.post("/employees", async (req, res, next) => {
    try {
        const employee = await employeeService.create(req.body);
        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
});

// Department routes
router.get("/departments", async (req, res, next) => {
    try {
        const departments = await departmentService.getAll();
        res.json(departments);
    } catch (error) {
        next(error);
    }
});

router.get("/departments/:id", async (req, res, next) => {
    try {
        const department = await departmentService.getById(Number(req.params.id));
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json(department);
    } catch (error) {
        next(error);
    }
});

// Bulk import route
router.post("/employees/bulk", upload.single("file"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const employees: Employee[] = [];
        const filePath = req.file.path;

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", async (row) => {
                const { name, position, departmentId, hireDate } = row;

                const department = await departmentService.getById(Number(departmentId));
                if (!department) {
                    console.log(`Department ID ${departmentId} not found. Skipping record.`);
                    return;
                }

                const employee = new Employee();
                employee.name = name;
                employee.position = position;
                employee.department = department;
                employee.hireDate = new Date(hireDate);
                employees.push(employee);
            })
            .on("end", async () => {
                await AppDataSource.getRepository(Employee).save(employees);
                fs.unlinkSync(filePath);
                res.json({ message: "Bulk import completed", count: employees.length });
            })
            .on("error", (error) => {
                next(error);
            });
    } catch (error) {
        next(error);
    }
});

export default router;