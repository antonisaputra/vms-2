import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitsService.create(createVisitDto);
  }

  @Get()
  findAll() {
    return this.visitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitsService.update(id, updateVisitDto);
  }
}