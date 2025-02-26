import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { TelegramMiddleware } from './telegram.middleware';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from '../app-config/app-config.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_BOT_TOKEN')!,
        launchOptions: {
          webhook: {
            domain: configService.get('BASE_URL')!,
            path: '/telegram/webhook',
            secretToken: configService.get('TELEGRAM_WEBHOOK_SECRET')!,
          },
        },
        include: [TelegramModule],
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    AppConfigModule,
    UserModule,
  ],
  providers: [TelegramService, TelegramUpdate],
  exports: [TelegramService],
})
export class TelegramModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TelegramMiddleware).forRoutes('telegram'); // This will apply to all /telegram/* routes
  }
}
