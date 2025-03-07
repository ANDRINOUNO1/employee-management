import { Repository, Like } from 'typeorm';
import { AppDataSource } from '../helpers/db';
import { Employee } from './employee.entity';
import { Department } from './department.entity';
import { DepartmentRoles } from '../helpers/department.role';

export class Employees {
    private employeeRepository: Repository<Employee> = AppDataSource.getRepository(Employee);
    private departmentRepository: Repository<Department> = AppDataSource.getRepository(Department);

    async getAll() {
        return this.employeeRepository.find({
            relations: ['department']
        });
    }  
    async getById(id: number) {
        return this.employeeRepository.findOne({
            where: { id },
            relations: ['department']
        });
    }
 
    async create(data: any) {  // Change type to any temporarily to handle departmentId
        // Check if position is already taken
        if (await this.employeeRepository.findOneBy({ position: data.position })) {
            throw new Error(`Position ${data.position} is already registered`);
        }

        // Create department if it doesn't exist
        let department = await this.departmentRepository.findOne({
            where: { id: data.departmentId }  // Use departmentId directly
        });

        if (!department) {
            department = this.departmentRepository.create({
                id: data.departmentId,
                name: this.getDepartmentRole(data.departmentId)
            });
            await this.departmentRepository.save(department);
        }

        const employee = this.employeeRepository.create({
            name: data.name,
            position: data.position,
            hireDate: data.hireDate,
            department: department,
            isActive: true,
            lastActivityDate: new Date()
        });

        return this.employeeRepository.save(employee);
    }

    private getDepartmentRole(id: number): DepartmentRoles {
        switch (id) {
            case 1:
                return DepartmentRoles.ENGINEERING;
            case 2:
                return DepartmentRoles.HR;
            case 3:
                return DepartmentRoles.MARKETING;
            case 4:
                return DepartmentRoles.SALES;
            case 5:
                return DepartmentRoles.FINANCE;
            case 6:
                return DepartmentRoles.IT;
            case 7:
                return DepartmentRoles.OPERATIONS;
            default:
                return DepartmentRoles.ENGINEERING;
        }
    }

    async update(id: number, data: Partial<Employee>) {
        const employee = await this.getById(id);
        if (!employee) throw new Error('employee cant be found');

        Object.assign(employee, data);
        return this.employeeRepository.save(employee);
    }

    async delete(id: number) {
        const employee = await this.getById(id);
        if (!employee) throw new Error('employee cant be found');

        return this.employeeRepository.remove(employee);
    }

    // Use Case 3: Update Salary
    async updateSalary(id: number, salary: number) {
        const employee = await this.getById(id);
        if (!employee) throw new Error('Employee not found');
        if (salary < 0) throw new Error('Salary cannot be negative');

        employee.salary = salary;
        employee.lastActivityDate = new Date();
        return this.employeeRepository.save(employee);
    }

    // Use Case 4: Soft Delete
    async softDelete(id: number) {
        const employee = await this.getById(id);
        if (!employee) throw new Error('Employee not found');

        employee.isActive = false;
        employee.lastActivityDate = new Date();
        return this.employeeRepository.save(employee);
    }

    // Use Case 5: Search by Name
    async searchByName(name: string) {
        return this.employeeRepository.find({
            where: {
                name: Like(`%${name}%`),
                isActive: true
            },
            relations: ['department']
        });
    }

    // Use Case 7: Calculate Tenure
    async calculateTenure(id: number) {
        const employee = await this.getById(id);
        if (!employee) throw new Error('Employee not found');

        const hireDate = new Date(employee.hireDate);
        const today = new Date();
        const years = today.getFullYear() - hireDate.getFullYear();
        const months = today.getMonth() - hireDate.getMonth();

        return {
            employeeId: employee.id,
            name: employee.name,
            hireDate: employee.hireDate,
            tenure: {
                years,
                months: months < 0 ? months + 12 : months
            }
        };
    }

    // Use Case 8: Transfer Department
    async transferDepartment(employeeId: number, newDepartmentId: number) {
        const employee = await this.getById(employeeId);
        if (!employee) throw new Error('Employee not found');

        const department = await this.departmentRepository.findOne({
            where: { id: newDepartmentId }
        });
        if (!department) throw new Error('Department not found');

        employee.department = department;
        employee.lastActivityDate = new Date();
        return this.employeeRepository.save(employee);
    }
}
export class Departments {
    private departmentRepository: Repository<Department> = AppDataSource.getRepository(Department);

    async getAll() {
        return this.departmentRepository.find({ select: ['id', 'name', 'employees'] });
    }  
    async getById(id: number) {
        return this.departmentRepository.findOneBy({ id });
    }
 
    async create(data: Partial<Department>) {
        const department = this.departmentRepository.create(data);
        return this.departmentRepository.save(department);
    }

    async update(id: number, data: Partial<Department>) {
        const department = await this.getById(id);
        if (!department) throw new Error('department cant be found');

        Object.assign(department, data);
        return this.departmentRepository.save(department);
    }

    async delete(id: number) {
        const department = await this.getById(id);
        if (!department) throw new Error('department cant be found');

        return this.departmentRepository.remove(department);
    }
}