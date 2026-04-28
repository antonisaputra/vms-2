
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  // backend/src/auth/auth.service.ts
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      // DEBUG: Cek apakah password dari DB dan input terbaca
      console.log('Password Input:', pass);
      console.log('Password DB (Hash):', user.password);

      const isMatch = await bcrypt.compare(pass, user.password);
      console.log('Apakah Cocok?:', isMatch);

      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(email: string, pass: string) {
    const user = await this.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid.');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }
}
