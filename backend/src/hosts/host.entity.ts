import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Host {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  department: string;

  @Column({ unique: true })
  email: string;
}