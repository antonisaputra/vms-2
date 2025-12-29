import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterForEventDto } from './dto/register-event.dto';

// HAPUS @UseGuards DARI SINI AGAR TIDAK MENGUNCI SEMUA ENDPOINT
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // 1. Kunci endpoint ini (Hanya Admin/Host yang boleh lihat daftar acara)
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // 2. Kunci endpoint ini (Hanya Admin/Host yang boleh buat acara)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get(':id') 
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // 3. JANGAN KUNCI endpoint ini (Agar Tamu Publik bisa mendaftar tanpa Login)
  // Tidak ada @UseGuards(JwtAuthGuard) di sini
  @Post(':id/register')
  registerForEvent(
    @Param('id') id: string,
    @Body() registerForEventDto: RegisterForEventDto,
  ) {
    return this.eventsService.registerForEvent(id, registerForEventDto);
  }
}