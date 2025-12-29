import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Host } from './host.entity';
import { CreateHostDto } from './dto/create-host.dto';

@Injectable()
export class HostsService {
  constructor(
    @InjectRepository(Host)
    private hostsRepository: Repository<Host>,
  ) {}

  findAll(): Promise<Host[]> {
    return this.hostsRepository.find();
  }
  
  // Included for future use, e.g. an admin page for hosts
  create(createHostDto: CreateHostDto): Promise<Host> {
    const host = this.hostsRepository.create(createHostDto);
    return this.hostsRepository.save(host);
  }
}