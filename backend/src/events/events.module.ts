import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { VisitsModule } from '../visits/visits.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), VisitsModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}