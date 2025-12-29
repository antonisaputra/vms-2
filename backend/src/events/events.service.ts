import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterForEventDto } from './dto/register-event.dto';
import { VisitsService } from '../visits/visits.service';
import { VisitStatus, Visitor } from '../types';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private visitsService: VisitsService,
  ) {}

  findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      order: {
        date: 'DESC',
      },
    });
  }

  create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async registerForEvent(
    eventId: string,
    visitorData: RegisterForEventDto,
  ) {
    const event = await this.findOne(eventId);

    // FIX: Provide a default value for the optional 'company' property to satisfy the 'Omit<Visitor, "id">' type.
    const visitor: Omit<Visitor, 'id'> = {
        ...visitorData,
        company: visitorData.company || 'N/A',
        phone: '', // Phone is not in DTO, default to empty
        photoUrl: `https://picsum.photos/seed/${visitorData.fullName.replace(/\s+/g, '')}/200`
    }

    // Create a new Visit record linked to this event
    const visit = await this.visitsService.create({
      visitor: visitor as any, // DTO matches structure, cast is acceptable
      purpose: `Peserta Acara: ${event.name}`,
      status: VisitStatus.Expected,
      checkInTime: event.date,
      checkinCode: `EVT${Math.floor(1000 + Math.random() * 9000)}`,
      eventInfo: {
        eventId: event.id,
        eventName: event.name,
      },
    });

    return visit;
  }
}
