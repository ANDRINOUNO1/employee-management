import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  salary: number;

  @ManyToOne(() => Department)
  department: Department;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  hireDate: Date;
}

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  
  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
