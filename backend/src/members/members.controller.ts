import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Konfigurasi Multer dipisah agar bisa digunakan berulang (reusable)
const multerConfig = {
  storage: diskStorage({
    destination: './uploads/members',
    filename: (req, file, cb) => {
      // Membuat nama file random yang unik
      const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
      cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Validasi tipe file (hanya gambar)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
    cb(null, true);
  },
};

@UseGuards(JwtAuthGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createMemberDto: CreateMemberDto) {
    // Jika file diunggah, gunakan path file, jika tidak gunakan photoUrl dari body (link)
    const photoUrl = file ? `/uploads/members/${file.filename}` : createMemberDto.photoUrl;
    return this.membersService.create({ ...createMemberDto, photoUrl });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async update(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File, 
    @Body() updateMemberDto: UpdateMemberDto
  ) {
    // Jika ada file baru yang diunggah, update path fotonya
    if (file) {
      updateMemberDto.photoUrl = `/uploads/members/${file.filename}`;
    }
    return this.membersService.update(id, updateMemberDto);
  }

  @Post('import')
  importMembers(@Body() createMemberDtos: CreateMemberDto[]) {
    return this.membersService.import(createMemberDtos);
  }

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}