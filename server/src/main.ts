import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';
import { TrpcRouter } from './trpc/trpc.router';
import * as express from 'express';
import { CustomLoggerService } from './logger/logger.service';
import { AllExceptionsFilter } from './logger/all-exceptions.filter';
import { AdminService } from './admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const bot = app.get(getBotToken());
  const logger = app.get(CustomLoggerService);
  
  const adminService = process.env.TELEGRAM_ADMIN_BOT_TOKEN ? app.get(AdminService) : undefined;
  
  if (adminService) {
    logger.setAdminService(adminService);
  }
  
  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionsFilter(logger, adminService));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.enableCors({ 
    origin: (origin, callback) => {
      const allowedOrigins = [
        'capacitor://localhost',
        'http://localhost',
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      // During development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }
      
      // In production, check against allowedOrigins
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });
  app.use(bot.webhookCallback('/telegram/webhook'));
  const trpc = app.get(TrpcRouter);
  trpc.applyMiddleware(app);

  await app.listen(process.env.PORT ?? 3000);
  logger.debug('Server started!');
}
bootstrap();
