import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Host } from './host.entity';
import { HostsController } from './hosts.controller';
import { HostsService } from './hosts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Host])],
  controllers: [HostsController],
  providers: [HostsService],
})
export class HostsModule {}