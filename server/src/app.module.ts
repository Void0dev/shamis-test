import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import { UserModule } from './user/user.module';
import { TrpcModule } from './trpc/trpc.module';
import { TelegramModule } from './telegram/telegram.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BroadcastModule } from './broadcast/broadcast.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
      validationSchema: Joi.object({
        BASE_URL: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        TELEGRAM_BOT_TOKEN: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        
        TELEGRAM_ADMIN_BOT_TOKEN: Joi.string().optional(),
        JWT_SECRET: Joi.string().default('sssssecret'),
        TELEGRAM_INIT: Joi.boolean().default(false),
        TELEGRAM_WEBHOOK_SECRET: Joi.string().default('Tsssecret'),
        OPENAI_API_KEY: Joi.string().optional(),
        ANTHROPIC_API_KEY: Joi.string().optional(),
        
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().valid('development', 'production').default('production'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database')!,
      inject: [ConfigService],
    }),
    ...(process.env.TELEGRAM_ADMIN_BOT_TOKEN ? [AdminModule] : []),
    AuthModule,
    UserModule,
    TrpcModule,
    TelegramModule,
    BroadcastModule,
    ScheduleModule.forRoot(),
    LoggerModule, 
    BroadcastModule,
    ChatModule,
  ],
})
export class AppModule {}
