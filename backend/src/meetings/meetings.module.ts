
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementMeeting } from './meeting.entity';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { MembersModule } from '../members/members.module'; // Import MembersModule if you need member services

@Module({
  imports: [TypeOrmModule.forFeature([ManagementMeeting]), MembersModule], // MembersModule might not be needed if not directly used in service
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
