import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BroadcastEntity } from './broadcast.entity';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../telegram/telegram.service';
import { UserService } from '../user/user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import sleep from 'src/utils/sleep';

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(
    @InjectRepository(BroadcastEntity)
    private broadcastRepository: Repository<BroadcastEntity>,
    private configService: ConfigService,
    private telegramService: TelegramService,
    private userService: UserService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processBroadcasts() {
    const unfinishedBroadcasts = await this.broadcastRepository.find({
      where: { 
        finished: false,
        toSend: true 
      },
    });

    for (const broadcast of unfinishedBroadcasts) {
      try {
        await this.processSingleBroadcast(broadcast);
      } catch (error: any) {
        this.logger.error(`Error processing broadcast ${broadcast.id}:`, error);
      }
    }
  }

  private async processSingleBroadcast(broadcast: BroadcastEntity) {
    const users = await this.userService.getUsersBatch(broadcast.userPointer);
    
    if (users.length === 0) {
      broadcast.finished = true;
      await this.broadcastRepository.save(broadcast);
      return;
    }

    for (const user of users) {
      try {
        if (broadcast.image) {
          await this.telegramService.sendPhoto(
            user.telegramId, 
            broadcast.image, 
            broadcast.message,
            broadcast.buttonUrl && broadcast.buttonText ? {
              url: broadcast.buttonUrl,
              text: broadcast.buttonText
            } : undefined
          );
        } else {
          await this.telegramService.sendMessage(
            user.telegramId, 
            broadcast.message,
            broadcast.buttonUrl && broadcast.buttonText ? {
              url: broadcast.buttonUrl,
              text: broadcast.buttonText
            } : undefined
          );
        }
        broadcast.userPointer = user.id;
        await this.broadcastRepository.save(broadcast);
        await sleep(1000 / this.configService.get<number>('TELEGRAM_BROADCAST_RPS', 30));
      } catch (error: any) {
        if (error.response?.statusCode === 429) {
          const retryAfter = error.response.parameters?.retry_after || 60;
          await sleep(retryAfter * 1000);
          continue;
        }
        if (this.telegramService.isTelegramBlockedError(error)) {
          this.logger.warn(`User ${user.telegramId} blocked the bot`);
          broadcast.userPointer = user.id;
          await this.broadcastRepository.save(broadcast);
          continue;
        }
        this.logger.error(`Error sending message to user ${user.telegramId}:`, error);
        broadcast.userPointer = user.id;
        await this.broadcastRepository.save(broadcast);
      }
    }
  }
}
