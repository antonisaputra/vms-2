
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ManagementMeeting } from './meeting.entity'
import { ManagementMember } from '../members/member.entity';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(ManagementMeeting)
    private meetingsRepository: Repository<ManagementMeeting>,

    @InjectRepository(ManagementMember)
    private membersRepository: Repository<ManagementMember>,
  ) { }

  create(createMeetingDto: CreateMeetingDto): Promise<ManagementMeeting> {
    // Cukup masukkan data dari DTO, biarkan Entity menangani defaultnya
    const meeting = this.meetingsRepository.create(createMeetingDto);

    // Inisialisasi secara eksplisit jika kolom di DB tidak punya default value
    meeting.attendees = [];
    meeting.invitedMemberIds = [];
    meeting.minutes = "";

    return this.meetingsRepository.save(meeting);
  }

  async findAll(): Promise<ManagementMeeting[]> {
    const meetings = await this.meetingsRepository.find({
      order: { date: 'DESC' }
    });

    // Pastikan properti attendees dan invitedMemberIds bukan null sebelum dikirim ke frontend
    return meetings.map(meeting => ({
      ...meeting,
      attendees: meeting.attendees || [],
      invitedMemberIds: meeting.invitedMemberIds || []
    }));
  }

  async findOne(id: string): Promise<ManagementMeeting> {
    const meeting = await this.meetingsRepository.findOneBy({ id });
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto): Promise<ManagementMeeting> {
    // Preload akan mencari data lama dan menggabungkannya dengan data baru (seperti minutes)
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

  // backend/src/meetings/meetings.service.ts

  async addAttendance(meetingId: string, memberId: string, signature: string) {
    const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Rapat tidak ditemukan');

    const newAttendee = {
      memberId,
      signatureDataUrl: signature,
      checkInTime: new Date(),
    };

    try {
      meeting.attendees = [...(meeting.attendees || []), newAttendee as any];
      await this.meetingsRepository.save(meeting); // <--- Pastikan proses save ini dipantau
    } catch (dbError) {
      console.error("Gagal simpan ke MySQL:", dbError.message);
      throw new Error("Database menolak menyimpan data. Mungkin ukuran tanda tangan terlalu besar.");
    }

    const member = await this.membersRepository.findOneBy({ id: memberId });
    return { success: true, memberName: member?.fullName || 'Anggota' };
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
