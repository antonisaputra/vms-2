
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../types'; // Shared types!

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Password won't be selected by default
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Receptionist,
  })
  role: UserRole;y
}
