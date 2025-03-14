import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Role } from '../helpers/role';
import { Employee } from './employee.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string; 

    @Column()
    title!: string;

    @Column()
    employeeId!: number;

    @OneToOne(() => Employee)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.User
    })
    role!: Role;
}