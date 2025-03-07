import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Employee } from './employee.entity';
import "reflect-metadata"; 
import { DepartmentRoles } from '../helpers/department.role';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: DepartmentRoles;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
