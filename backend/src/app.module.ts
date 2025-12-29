import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { User } from './users/user.entity';
import { ManagementMember } from './members/member.entity';
import { MeetingsModule } from './meetings/meetings.module';
import { ManagementMeeting } from './meetings/meeting.entity';
import { VisitsModule } from './visits/visits.module';
import { HostsModule } from './hosts/hosts.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import { Visit } from './visits/visit.entity';
import { Host } from './hosts/host.entity';
import { BlacklistedPerson } from './blacklist/blacklist.entity';
import { EventsModule } from './events/events.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { Event } from './events/event.entity';
import { ActivityLog } from './activity-log/activity-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        User,
        ManagementMember,
        ManagementMeeting,
        Visit,
        Host,
        BlacklistedPerson,
        Event,
        ActivityLog,
      ],
      synchronize: true, // In development, this creates DB tables automatically. Disable in production.
    }),
    AuthModule,
    UsersModule,
    MembersModule,
    MeetingsModule,
    VisitsModule,
    HostsModule,
    BlacklistModule,
    EventsModule,
    ActivityLogModule,
  ],
})
export class AppModule {}