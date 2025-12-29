import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedPerson } from './blacklist.entity';
import { CreateBlacklistDto } from './dto/create-blacklist.dto';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(BlacklistedPerson)
    private blacklistRepository: Repository<BlacklistedPerson>,
  ) {}

  findAll(): Promise<BlacklistedPerson[]> {
    return this.blacklistRepository.find({
        order: {
            addedAt: 'DESC'
        }
    });
  }

  create(createBlacklistDto: CreateBlacklistDto): Promise<BlacklistedPerson> {
    const person = this.blacklistRepository.create(createBlacklistDto);
    return this.blacklistRepository.save(person);
  }

  async isBlacklisted(fullName: string): Promise<boolean> {
      const count = await this.blacklistRepository.count({ where: { fullName }});
      return count > 0;
  }
}