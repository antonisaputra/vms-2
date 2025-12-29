
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementMember } from './member.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ManagementMember])],
  providers: [MembersService],
  controllers: [MembersController],
})
export class MembersModule {}
