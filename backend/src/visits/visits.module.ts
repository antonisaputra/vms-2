
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visit } from './visit.entity';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { BlacklistModule } from '../blacklist/blacklist.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Visit]), BlacklistModule, ActivityLogModule],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService], // <-- FIX: Export the service
})
export class VisitsModule {}
