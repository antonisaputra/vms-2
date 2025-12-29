import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class BlacklistedPerson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column('text')
  reason: string;

  @CreateDateColumn()
  addedAt: Date;
}