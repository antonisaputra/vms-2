import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  findAll(): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      order: {
        timestamp: 'DESC',
      },
      take: 50, // Limit to the last 50 logs for performance
    });
  }

  create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    const log = this.activityLogRepository.create(createActivityLogDto);
    return this.activityLogRepository.save(log);
  }
}