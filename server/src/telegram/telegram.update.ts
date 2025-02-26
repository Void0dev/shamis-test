import { Start, Update, Help } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';

@Update()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) {}

  @Start()
  async startCommand(ctx: Context): Promise<void> {
    await this.telegramService.handleStart(ctx);
  }

  @Help()
  async helpCommand(ctx: Context): Promise<void> {
    await this.telegramService.handleHelp(ctx);
  }
}
