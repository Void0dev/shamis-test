import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Telegraf } from 'telegraf';
import { UserService } from '../user/user.service';
import { CustomLoggerService } from '../logger/logger.service';
import { InjectBot } from 'nestjs-telegraf';
import { Cron, CronExpression } from '@nestjs/schedule';
import dedent from 'ts-dedent';

@Injectable()
export class AdminService implements OnModuleInit {
  private enabled = false;

  private TG_BUFFERED_MESSAGE_DELIMITER = '\n\n';
  private TG_MAX_SYMBOLS_COUNT = 4096;
  private messagesBuffer: string[] = [];

  constructor(
    @InjectBot('Admin') private bot: Telegraf<Context>,
    private configService: ConfigService,
    private userService: UserService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext(AdminService.name);
    const token = this.configService.get<string>('TELEGRAM_ADMIN_BOT_TOKEN');
    if (!token) {
      this.logger.warn('Admin bot is disabled: Missing TELEGRAM_ADMIN_BOT_TOKEN');
      return;
    }
    this.enabled = true;
  }

  async onModuleInit() {
    if (!this.enabled) return;

    this.logger.log('Starting admin bot initialization...');

    try {

      await this.bot.telegram.setMyCommands([
        { command: 'start', description: 'Start the bot' },
        { command: 'help', description: 'Show help information' },
      ]);

      this.bot.use(async (ctx, next) => {
        try {
          const user = await this.userService.findByTelegramId(ctx.from?.id?.toString() || '');
          if (!user?.isAdmin) {
            return;
          }
          return next();
        } catch (error) {
          this.logger.error('Error in admin middleware', error);
          await ctx.reply('❌ An error occurred while checking permissions');
          return;
        }
      });
      
      this.setupCommands();
      this.logger.log('Admin bot initialized successfully');
    } catch (err: any) {
      this.logger.error('Error initializing admin bot', err);
    }
  }

  private setupCommands() {
    if (!this.bot) return;

    // Help command
    this.bot.command('help', async ctx => {
      const message = dedent`🤖 Available Commands:
/start - Start the bot
/help - Show help information
`;

      await ctx.reply(message);
    });

     
    // Start command
    this.bot.command('start', async ctx => {
      await ctx.reply('Welcome to the admin bot!');
    });
  }

  async broadcastToAdmins(message: string) {
    this.messagesBuffer.push(message);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async broadcastToAdminProcess() {
    if (!this.enabled || !this.bot) return;
    let sizeCounter = 0;
    let thresholdIndex = 0;
    for (const [index, msg] of this.messagesBuffer.entries()) {
      sizeCounter += msg.length + this.TG_BUFFERED_MESSAGE_DELIMITER.length;
      if (sizeCounter <= this.TG_MAX_SYMBOLS_COUNT) {
        thresholdIndex = index;
      }
    }

    const bufferedMessage = this.messagesBuffer.slice(0, thresholdIndex + 1).join(this.TG_BUFFERED_MESSAGE_DELIMITER);
    this.messagesBuffer = this.messagesBuffer.slice(thresholdIndex + 1);

    const adminUsers = await this.userService.findAdminUsers();
    await Promise.allSettled(
      adminUsers.map(user =>
        this.bot.telegram.sendMessage(user.telegramId, bufferedMessage, {
          disable_notification: true,
        })
      )
    );
  }
}
