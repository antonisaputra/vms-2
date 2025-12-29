
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagementMeeting } from './meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(ManagementMeeting)
    private meetingsRepository: Repository<ManagementMeeting>,
  ) {}

  create(createMeetingDto: CreateMeetingDto): Promise<ManagementMeeting> {
    const meeting = this.meetingsRepository.create({
        ...createMeetingDto,
        attendees: [],
        invitedMemberIds: [],
    });
    return this.meetingsRepository.save(meeting);
  }

  findAll(): Promise<ManagementMeeting[]> {
    return this.meetingsRepository.find({
        order: {
            date: 'DESC'
        }
    });
  }

  async findOne(id: string): Promise<ManagementMeeting> {
    const meeting = await this.meetingsRepository.findOneBy({ id });
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto): Promise<ManagementMeeting> {
    const meeting = await this.meetingsRepository.preload({
        id: id,
        ...updateMeetingDto,
    });
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return this.meetingsRepository.save(meeting);
  }

  async remove(id: string): Promise<void> {
    const result = await this.meetingsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
  }
  
  async duplicate(id: string): Promise<ManagementMeeting> {
      const original = await this.findOne(id);
      
      // FIX: Pisahkan 'id' dari data lainnya agar tidak ikut tersalin
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: oldId, ...rest } = original;

      const newMeeting = this.meetingsRepository.create({
          ...rest, // Salin semua data KECUALI id
          title: `[DUPLIKAT] ${original.title}`,
          date: new Date(), // Reset tanggal ke hari ini
          attendees: [], // Kosongkan kehadiran
          minutes: '', // Kosongkan notulensi
          invitedMemberIds: original.invitedMemberIds, // Tetap undang anggota yang sama
      });

      return this.meetingsRepository.save(newMeeting);
  }

  async inviteMembers(id: string, memberIds: string[]): Promise<ManagementMeeting> {
      const meeting = await this.findOne(id);
      const currentInvited = new Set(meeting.invitedMemberIds);
      memberIds.forEach(id => currentInvited.add(id));
      meeting.invitedMemberIds = Array.from(currentInvited);
      return this.meetingsRepository.save(meeting);
  }
  
  async removeAttendance(id: string, memberId: string): Promise<ManagementMeeting> {
      const meeting = await this.findOne(id);
      meeting.attendees = meeting.attendees.filter(att => att.memberId !== memberId);
      return this.meetingsRepository.save(meeting);
  }
}
