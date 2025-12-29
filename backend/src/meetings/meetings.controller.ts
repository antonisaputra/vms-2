
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { InviteMembersDto } from './dto/invite-members.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(createMeetingDto);
  }

  @Get()
  findAll() {
    return this.meetingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(id, updateMeetingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }
  
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
      return this.meetingsService.duplicate(id);
  }

  @Post(':id/invite')
  inviteMembers(@Param('id') id: string, @Body() inviteMembersDto: InviteMembersDto) {
      return this.meetingsService.inviteMembers(id, inviteMembersDto.memberIds);
  }
  
  @Delete(':id/attendance/:memberId')
  removeAttendance(@Param('id') id: string, @Param('memberId') memberId: string) {
      return this.meetingsService.removeAttendance(id, memberId);
  }
}
