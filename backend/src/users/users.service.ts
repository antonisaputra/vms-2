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
  ) { }

  // --- SEEDING OTOMATIS (DIPERBARUI) ---
  // Menambahkan Admin, Resepsionis, dan Host jika database kosong
  async onModuleInit() {
    const adminEmail = 'admin@hamzanwadi.ac.id';
    const adminExists = await this.findOneByEmail(adminEmail);

    if (!adminExists) {
      console.log('⚠️ Database User kosong. Melakukan Seeding...');

      // Gunakan salt rounds yang standar (10)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);

      const defaultUsers = [
        { name: 'Super Admin', email: adminEmail, password: hashedPassword, role: UserRole.Administrator },
        { name: 'Resepsionis', email: 'receptionist@hamzanwadi.ac.id', password: hashedPassword, role: UserRole.Receptionist },
        { name: 'Dosen Host', email: 'dosen@hamzanwadi.ac.id', password: hashedPassword, role: UserRole.Host }
      ];

      for (const userData of defaultUsers) {
        const user = this.usersRepository.create(userData);
        await this.usersRepository.save(user);
      }
      console.log('✅ Seeding berhasil dengan password terenkripsi.');
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
    if (createUserDto.password) {
      // Gunakan cost factor yang sama (10) agar konsisten
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  // UPDATE
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      // Gunakan cost factor yang sama (10)
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
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