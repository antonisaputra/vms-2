import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { VisitStatus, Visitor, Host } from '../types';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json' })
  visitor: Visitor;

  @Column({ type: 'json', nullable: true })
  host?: Host;

  @Column({ nullable: true })
  destination?: string;

  @Column()
  purpose: string;

  @Column({ type: 'enum', enum: VisitStatus })
  status: VisitStatus;

  @Column({ type: 'timestamp' })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime?: Date;

  @Column({ type: 'text', nullable: true })
  signatureDataUrl?: string;

  @Column({ nullable: true })
  checkinCode?: string;
  
  // You might want a json column for eventInfo as well
  @Column({ type: 'json', nullable: true })
  eventInfo?: {
    eventId: string;
    eventName: string;
  };
}