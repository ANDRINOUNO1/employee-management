import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import csvParser from "csv-parser";
import { AppDataSource } from "../helpers/db";
import { Employee } from "./employee.entity";
import { Department } from "./department.entity";
import { Employees, Departments } from "./employee.service";
import fs from "fs";
import { DepartmentRoles } from '../helpers/department.role';

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const employeeService = new Employees();
const departmentService = new Departments();

// Employee Routes
// 1. Search route must come before other GET routes to avoid conflict
router.get("/employees/search", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const name = req.query.name as string;
        if (!name) {
            return res.status(400).json({ message: "Name parameter is required" });
        }
        const employees = await employeeService.searchByName(name);
        res.json(employees);
    } catch (error) {
        next(error);
    }
});

// 2. Get all employees with optional pagination
router.get("/employees", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const employees = await employeeService.getAll();
        res.json(employees);
    } catch (error) {
        next(error);
    }
});

// 3. Get employee by ID
router.get("/employees/:id", async (req: Request, res: Response, next: NextFunction) => {
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

// 4. Get employee tenure
router.get("/employees/:id/tenure", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenure = await employeeService.calculateTenure(Number(req.params.id));
        res.json(tenure);
    } catch (error) {
        next(error);
    }
});

// 5. Create new employee
router.post("/employees", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, position, departmentId, hireDate } = req.body;
        
        if (!name || !departmentId) {
            return res.status(400).json({ message: "Name and departmentId are required" });
        }

        const employee = await employeeService.create({
            name,
            position,
            department: { id: departmentId },
            hireDate: hireDate ? new Date(hireDate) : new Date()
        });
        
        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
});

// 6. Bulk import employees 
router.post("/employees/bulk", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeesData = req.body;
        
        if (!Array.isArray(employeesData)) {
            return res.status(400).json({ message: "Request body must be an array" });
        }

        const employees: Employee[] = [];

        for (const data of employeesData) {
            // Validate required fields
            if (!data.name || !data.departmentId) {
                console.log('Skipping record: Missing required fields');
                continue;
            }

            // Parse departmentId as number and validate
            const departmentId = parseInt(data.departmentId);
            if (isNaN(departmentId)) {
                console.log(`Invalid department ID: ${data.departmentId}`);
                continue;
            }

            const department = await departmentService.getById(departmentId);
            if (!department) {
                console.log(`Department ID ${departmentId} not found. Skipping record.`);
                continue;
            }

            const employee = new Employee();
            employee.name = data.name;
            employee.position = department.name;
            employee.department = department;
            employee.hireDate = data.hireDate ? new Date(data.hireDate) : new Date();
            employee.salary = parseFloat(data.salary) || 0;
            employee.isActive = true;
            employee.lastActivityDate = new Date();

            employees.push(employee);
        }

        if (employees.length === 0) {
            return res.status(400).json({ 
                message: "No valid employees to import" 
            });
        }

        const savedEmployees = await AppDataSource.getRepository(Employee).save(employees);
        
        res.json({ 
            message: "Bulk import completed", 
            count: employees.length,
            employees: savedEmployees
        });
    } catch (error) {
        next(error);
    }
});

// 7. Update employee salary
router.put("/employees/:id/salary", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { salary } = req.body;
        if (typeof salary !== 'number' || salary < 0) {
            return res.status(400).json({ message: "Valid salary is required" });
        }
        const employee = await employeeService.updateSalary(Number(req.params.id), salary);
        res.json(employee);
    } catch (error) {
        next(error);
    }
});

// 8. Transfer employee to another department
router.put("/employees/:id/transfer", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { departmentId } = req.body;
        if (!departmentId) {
            return res.status(400).json({ message: "DepartmentId is required" });
        }
        const employee = await employeeService.transferDepartment(Number(req.params.id), departmentId);
        res.json(employee);
    } catch (error) {
        next(error);
    }
});

// 9. Update employee
router.put("/employees/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employee = await employeeService.update(Number(req.params.id), req.body);
        res.json(employee);
    } catch (error) {
        next(error);
    }
});

// 10. Soft delete employee
router.delete("/employees/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await employeeService.softDelete(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Department Routes
router.get("/departments", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await departmentService.getAll();
        res.json(departments);
    } catch (error) {
        next(error);
    }
});

router.get("/departments/:id", async (req: Request, res: Response, next: NextFunction) => {
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

export default router;