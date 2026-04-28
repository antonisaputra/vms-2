import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { ManagementMeeting } from './meeting.entity';
import { ManagementMember } from '../members/member.entity'; // Impor Entity Member

@Module({
  imports: [
    // Tambahkan ManagementMember di sini agar Repository-nya tersedia untuk MeetingsService
    TypeOrmModule.forFeature([ManagementMeeting, ManagementMember])
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}