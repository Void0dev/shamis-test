import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getUserByJWT(authHeader: string) {
    const token = authHeader.replace('Bearer ', '');

    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_SECRET')!,
    });

    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async generateToken(userId: number) {
    return this.jwtService.sign({ sub: userId }, {
      secret: this.configService.get('JWT_SECRET')!,
    });
  }
}
