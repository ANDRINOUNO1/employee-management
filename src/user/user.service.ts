import { Repository } from 'typeorm';
import { AppDataSource } from '../helpers/db';
import { User } from '../employee/user.entity';
import { Employee } from '../employee/employee.entity';

export class UserService {
    private userRepository: Repository<User> = AppDataSource.getRepository(User);
    private employeeRepository: Repository<Employee> = AppDataSource.getRepository(Employee);

    async create(userData: Partial<User>) {
        // Check if employee exists
        const employee = await this.employeeRepository.findOne({
            where: { id: userData.employeeId }
        });

        if (!employee) {
            throw new Error('Employee not found. Cannot create user without valid employee');
        }

        // Check if email is already registered
        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Check if employee already has a user account
        const existingEmployeeUser = await this.userRepository.findOne({
            where: { employeeId: userData.employeeId }
        });

        if (existingEmployeeUser) {
            throw new Error('This employee already has a user account');
        }

        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['employee']
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        return user;
    }
} 