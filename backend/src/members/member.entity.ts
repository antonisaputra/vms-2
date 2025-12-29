
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ManagementMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nidn: string;

  @Column()
  fullName: string;

  @Column()
  faculty: string;

  @Column()
  studyProgram: string;

  @Column()
  position: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  photoUrl: string;
}
