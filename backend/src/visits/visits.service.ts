import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { BlacklistService } from '../blacklist/blacklist.service';
import { VisitStatus } from '../types';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitsRepository: Repository<Visit>,
    private blacklistService: BlacklistService,
    private activityLogService: ActivityLogService,
  ) {}

  async create(createVisitDto: CreateVisitDto): Promise<Visit> {
    const isBlacklisted = await this.blacklistService.isBlacklisted(createVisitDto.visitor.fullName);
    if (isBlacklisted) {
      throw new ForbiddenException('Visitor is on the blacklist.');
    }
    const visit = this.visitsRepository.create({
        ...createVisitDto,
        // Ensure some defaults are set if not provided by DTO
        status: createVisitDto.status || VisitStatus.OnSite,
        checkInTime: createVisitDto.checkInTime || new Date(),
        visitor: { ...createVisitDto.visitor, id: `visitor-${Date.now()}` }
    });
    return this.visitsRepository.save(visit);
  }

  findAll(): Promise<Visit[]> {
    return this.visitsRepository.find({
        order: {
            checkInTime: 'DESC'
        }
    });
  }

  async findOne(id: string): Promise<Visit> {
    const visit = await this.visitsRepository.findOneBy({ id });
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }
    return visit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto): Promise<Visit> {
    const visit = await this.visitsRepository.preload({
        id: id,
        ...updateVisitDto,
    });
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }
    return this.visitsRepository.save(visit);
  }

  async checkInVisitor(visitData: any) {
    // 1. Logik simpan visit (contoh)
    const newVisit = this.visitsRepository.create(visitData);
    await this.visitsRepository.save(newVisit);

    // 2. SIMPAN LOG KE DATABASE
    // Ini akan memanggil function create() dalam ActivityLogService yang anda upload
    await this.activityLogService.create({
      type: 'checkin', // Mesti salah satu dari enum: 'checkin', 'checkout', 'preregister'
      text: `Pelawat ${visitData.name} telah mendaftar masuk.`,
    });

    return newVisit;
  }
}