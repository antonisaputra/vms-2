import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlacklistService } from './blacklist.service';
import { CreateBlacklistDto } from './dto/create-blacklist.dto';

@UseGuards(JwtAuthGuard)
@Controller('blacklist')
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Get()
  findAll() {
    return this.blacklistService.findAll();
  }

  @Post()
  create(@Body() createBlacklistDto: CreateBlacklistDto) {
    return this.blacklistService.create(createBlacklistDto);
  }
}