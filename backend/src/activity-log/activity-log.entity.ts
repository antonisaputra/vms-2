import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['checkin', 'checkout', 'preregister'],
  })
  type: 'checkin' | 'checkout' | 'preregister';

  @Column('text')
  text: string;

  @CreateDateColumn()
  timestamp: Date;
}