import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistedPerson } from './blacklist.entity';
import { BlacklistController } from './blacklist.controller';
import { BlacklistService } from './blacklist.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlacklistedPerson])],
  controllers: [BlacklistController],
  providers: [BlacklistService],
  exports: [BlacklistService], // Export for VisitsService
})
export class BlacklistModule {}