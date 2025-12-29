
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagementMember } from './member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(ManagementMember)
    private membersRepository: Repository<ManagementMember>,
  ) {}

  create(createMemberDto: CreateMemberDto): Promise<ManagementMember> {
    const member = this.membersRepository.create(createMemberDto);
    return this.membersRepository.save(member);
  }

  async import(createMemberDtos: CreateMemberDto[]): Promise<{ count: number }> {
    const members = this.membersRepository.create(createMemberDtos);
    const savedMembers = await this.membersRepository.save(members);
    return { count: savedMembers.length };
  }

  findAll(): Promise<ManagementMember[]> {
    return this.membersRepository.find();
  }

  findOne(id: string): Promise<ManagementMember> {
    const member = this.membersRepository.findOneBy({ id });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<ManagementMember> {
    const member = await this.membersRepository.preload({
        id: id,
        ...updateMemberDto,
    });
    if (!member) {
        throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return this.membersRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const result = await this.membersRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`Member with ID ${id} not found`);
    }
  }
}
