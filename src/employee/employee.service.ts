import { Repository } from 'typeorm';
import { AppDataSource } from '../helpers/db';
import { Employee } from './employee.entity';
import { Department } from './department.entity';

export class Employees {
    private employeeRepository: Repository<Employee> = AppDataSource.getRepository(Employee);

    async getAll() {
        return this.employeeRepository.find({
            relations: ['department'],
            select: ['id', 'name', 'position', 'salary', 'isActive', 'hireDate']
        });
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