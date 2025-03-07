import { Repository } from 'typeorm';
import { AppDataSource } from '../helpers/db';
import { Employee } from './employee.entity';
import { Department } from './employee.entity';

export class Employees {
    private employeeRepository: Repository<Employee> = AppDataSource.getRepository(Employee);

    async getAll() {
        return this.employeeRepository.find({ select: ['id', 'name', 'position', 'address', 'salary', 'department', 'isActive', 'hireDate'] });
    }  
    async getById(id: number) {
        return this.employeeRepository.findOneBy({ id });
    }
 
    async create(data: Partial<Employee>) {
        if (await this.employeeRepository.findOneBy({ position: data.position })) {
            throw new Error(`Position ${data.position} is already registered`);
        }

        const employee = this.employeeRepository.create(data);
        return this.employeeRepository.save(employee);
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
        if (await this.departmentRepository.findOneBy({ position: data.employees })) {
            throw new Error(`Employees ${data.employees} are already registered`);
        }

        const employee = this.departmentRepository.create(data);
        return this.departmentRepository.save(employee);
    }

    async update(id: number, data: Partial<Employee>) {
        const employee = await this.getById(id);
        if (!employee) throw new Error('employee cant be found');

        Object.assign(employee, data);
        return this.departmentRepository.save(employee);
    }

    async delete(id: number) {
        const employee = await this.getById(id);
        if (!employee) throw new Error('employee cant be found');

        return this.departmentRepository.remove(employee);
    }
}