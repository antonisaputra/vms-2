
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

  // PERBAIKAN: Hapus default: '[]'
  @Column({ type: 'longtext', nullable: true })
  attendees: MeetingAttendance[];

  // PERBAIKAN: Hapus default: '[]'
  @Column({ type: 'json', nullable: true })
  invitedMemberIds: string[];

  @Column({ type: 'text', nullable: true })
  minutes?: string;

  @Column({ type: 'longtext', nullable: true }) // Gunakan longtext untuk Base64 Image
  signature: string;
}
