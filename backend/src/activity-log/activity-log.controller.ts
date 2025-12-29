import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityLogService } from './activity-log.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll() {
    return this.activityLogService.findAll();
  }

  @Post()
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogService.create(createActivityLogDto);
  }
}