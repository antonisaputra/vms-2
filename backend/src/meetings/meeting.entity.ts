
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { MeetingAttendance } from '../types';

@Entity()
export class ManagementMeeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  location: string;

  @Column({ type: 'json', default: '[]' })
  attendees: MeetingAttendance[];

  @Column({ type: 'json', default: '[]' })
  invitedMemberIds: string[];

  @Column({ type: 'text', nullable: true })
  minutes?: string;

  @Column({ type: 'longtext', nullable: true }) // Gunakan longtext untuk Base64 Image
  signature: string;
}
