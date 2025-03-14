import express, { Request , Response , NextFunction, RequestHandler } from "express"
import multer from "multer";
import csvParser from "csv-parser";
import { AppDataSource } from "../helpers/db";
import { Employee } from "./employee.entity";
import { Department } from "./department.entity";
import { Employees, Departments, CustomerService } from "./employee.service";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const employeeService = new Employees();
const departmentService = new Departments();
const userService = new CustomerService();

router.post("/users", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getAll();
        res.json(user);
    } catch (error) {
        next(error);
    }
});

router.get("/users/:id", (async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employee = await userService.getById(Number(req.params.id));
        if (!employee) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
}) as RequestHandler);

router.put("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.update(Number(req.params.id), req.body);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

router.delete('/users/:id', async (req, res, next) => {
    try { res.json(await userService.delete(Number(req.params.id))); }
    catch (err) { next(err); }
});

// Get all employees
router.get("/employees", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employees = await employeeService.getAll();
        res.json(employees);
    } catch (error) {
        next(error);
    }
});

// Get employee by ID
router.get("/employees/:id", (async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employee = await employeeService.getById(Number(req.params.id));
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
}) as RequestHandler);

// Create employee
router.post("/employees", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employee = await employeeService.create(req.body);
        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
});

// Update employee
router.put("/employees/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employee = await employeeService.update(Number(req.params.id), req.body);
        res.json(employee);
    } catch (error) {
        next(error);
    }
});

// Delete employee
router.delete("/employees/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await employeeService.delete(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Bulk import employees
router.post("/employees/bulk", upload.single("file"), (async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const employees: Employee[] = [];
        const filePath = req.file.path;

        const stream = fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", async (row) => {
                try {
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
                } catch (error) {
                    console.error('Error processing row:', error);
                }
            });

        // Use promises to handle stream events
        await new Promise((resolve, reject) => {
            stream.on("end", resolve);
            stream.on("error", reject);
        });

        // Save all employees after stream is complete
        await AppDataSource.getRepository(Employee).save(employees);
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        res.json({ 
            message: "Bulk import completed", 
            count: employees.length 
        });
    } catch (error) {
        // Clean up file if exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}) as RequestHandler);

// Get all departments
router.get("/departments", async (req : Request, res : Response, next : NextFunction) => {
    try {
        const departments = await departmentService.getAll();
        res.json(departments);
    } catch (error) {
        next(error);
    }
});

// Get department by ID
router.get("/departments/:id", (async (req: Request, res: Response, next: NextFunction) => {
    try {
        const department = await departmentService.getById(Number(req.params.id));
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json(department);
    } catch (error) {
        next(error);
    }
}) as RequestHandler);

// Use Case 3: Update Salary
router.put("/employees/:id/salary", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { salary } = req.body;
        const employee = await employeeService.updateSalary(Number(req.params.id), salary);
        res.json(employee);
    } catch (error) {
        next(error);
    }
});


// Use Case 4: Soft Delete Employee
router.delete("/employees/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await employeeService.softDelete(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Use Case 5: Search Employees by Name 
router.get("/employees/search", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const name = req.query.name as string;
        const employees = await employeeService.searchByName(name);
        res.json(employees);
    } catch (error) {
        next(error);
    }
});

// Use Case 7: Get Employee Tenure
router.get("/employees/:id/tenure", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenure = await employeeService.calculateTenure(Number(req.params.id));
        res.json(tenure);
    } catch (error) {
        next(error);
    }
});

// Use Case 8: Transfer Employee
router.put("/employees/:id/transfer", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { departmentId } = req.body;
        const employee = await employeeService.transferDepartment(Number(req.params.id), departmentId);
        res.json(employee);
    } catch (error) {
        next(error);
    }
});

export default router;