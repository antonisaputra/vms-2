import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HostsService } from './hosts.service';

@UseGuards(JwtAuthGuard)
@Controller('hosts')
export class HostsController {
  constructor(private readonly hostsService: HostsService) {}

  @Get()
  findAll() {
    return this.hostsService.findAll();
  }
}