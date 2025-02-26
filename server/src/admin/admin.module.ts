import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserModule } from 'src/user/user.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      botName: 'Admin',
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_ADMIN_BOT_TOKEN')!,
        include: [AdminModule],
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ConfigModule,
  ],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
