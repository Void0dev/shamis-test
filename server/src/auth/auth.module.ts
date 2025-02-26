import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthRouter } from './auth.router';
import { TrpcModule } from '../trpc/trpc.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET')!,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 5000,
        limit: 5,
      },
    ]),
    TrpcModule,
  ],
  providers: [AuthService, JwtStrategy, AuthRouter],
  exports: [AuthService, AuthRouter],
})
export class AuthModule {}
