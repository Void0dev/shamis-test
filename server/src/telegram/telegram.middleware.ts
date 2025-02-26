import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TelegramMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (
      req.headers['x-telegram-bot-api-secret-token'] !==
      this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET')
    ) {
      return res.status(403).json({ message: 'Invalid telegram webhook signature' });
    }

    next();
  }
}
