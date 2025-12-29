
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT.
    // We can add more validation here, e.g., check if user still exists.
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
        throw new UnauthorizedException();
    }
    // NestJS will attach this return value to the request object as `request.user`
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
