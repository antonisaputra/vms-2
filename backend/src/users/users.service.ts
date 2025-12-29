import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../types'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // --- SEEDING OTOMATIS (DIPERBARUI) ---
  // Menambahkan Admin, Resepsionis, dan Host jika database kosong
  async onModuleInit() {
    const adminEmail = 'admin@hamzanwadi.ac.id';
    const adminExists = await this.findOneByEmail(adminEmail);

    if (!adminExists) {
      console.log('⚠️ Database User kosong. Melakukan Seeding Data Dummy...');
      
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('password123', salt);

      // 1. Buat Administrator
      const admin = this.usersRepository.create({
        name: 'Super Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.Administrator,
      });
      await this.usersRepository.save(admin);

      // 2. Buat Resepsionis
      const receptionist = this.usersRepository.create({
        name: 'Resepsionis Utama',
        email: 'receptionist@hamzanwadi.ac.id',
        password: hashedPassword,
        role: UserRole.Receptionist,
      });
      await this.usersRepository.save(receptionist);

      // 3. Buat Host (Dosen/Staf)
      const host = this.usersRepository.create({
        name: 'Dosen Pengampu',
        email: 'dosen@hamzanwadi.ac.id',
        password: hashedPassword,
        role: UserRole.Host,
      });
      await this.usersRepository.save(host);

      console.log('✅ Data User berhasil dibuat!');
      console.log('   - Admin: admin@hamzanwadi.ac.id');
      console.log('   - Resepsionis: receptionist@hamzanwadi.ac.id');
      console.log('   - Host: dosen@hamzanwadi.ac.id');
      console.log('🔑 Password Default Semua Akun: password123');
    }
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') 
      .getOne();
  }

  // --- CREATE (DIPERBAIKI) ---
  // Kita hash password secara manual disini agar konsisten dengan update
  // dan tidak bergantung pada @BeforeInsert entity yang mungkin bermasalah
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. Hash password sebelum disimpan
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    }

    // 2. Simpan user
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  // UPDATE
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const user = await this.usersRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}