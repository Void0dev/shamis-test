import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { AppConfigService } from '../app-config/app-config.service';
import { CustomLoggerService } from '../logger/logger.service';
import { Context, Markup, Telegraf } from 'telegraf';
import { BotCommand } from 'telegraf/typings/core/types/typegram';
import sleep from '../utils/sleep';
import { getContextPayload } from './telegram.utils';
import { UserService } from '../user/user.service';

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot() private bot: Telegraf,
    private readonly configService: ConfigService,
    private readonly appConfigService: AppConfigService,
    private readonly logger: CustomLoggerService,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(TelegramService.name);
    this.init();
  }

  private async init() {
    if (this.configService.get('TELEGRAM_INIT')) {
      try {
        this.logger.log('Starting bot initialization...');

        this.logger.log('Setting commands...');
        await this.setCommands();
        await sleep(100);
        this.logger.log('Setting bot description...');
        await this.setBotDescription();
        await sleep(100);
        
        this.logger.log('Setting short description...');
        await this.setShortDescription();
        await sleep(100);
        
        this.logger.log('Setting bot name...');
        await this.setBotName();
        await sleep(100);

        this.logger.log('Telegram bot initialized successfully');
      } catch (error) {
        this.logger.error('Error initializing Telegram bot:', error);
      }
    }
  }

  async handleStart(ctx: Context) {
    const buttonText = await this.appConfigService.get('botButtonText');
    const buttonUrl = await this.appConfigService.get('botButtonUrl');

    const startPayload = getContextPayload(ctx);

    if (ctx.from) {
      const user = await this.userService.findByTelegramId(ctx.from.id.toString());

      if (!user) {
        await this.userService.createUserFromTelegram({
          telegramId: ctx.from.id.toString(),
          firstName: ctx.from.first_name || null,
          lastName: ctx.from.last_name || null,
          username: ctx.from.username || null,
          localTime: new Date(),
          languageCode: null,
          tonAddress: null,
          isAdmin: false,
          avatarUrl: null,
          ref: startPayload || null,
        });
      } else if (
        user.username !== ctx.from.username ||
        user.firstName !== ctx.from.first_name ||
        user.lastName !== ctx.from.last_name) {
        await this.userService.updateUser(user.id, {
          username: ctx.from.username || null,
          firstName: ctx.from.first_name || null,
          lastName: ctx.from.first_name || null,
        });
      }
    }

    return ctx.reply(
      await this.appConfigService.get('botStart'),
      buttonText && buttonUrl
        ? Markup.inlineKeyboard([Markup.button.url(buttonText, buttonUrl)])
        : undefined
    );
  }

  async setCommands() {
    const commands: BotCommand[] = [
      { command: 'start', description: 'Start the bot' },
      { command: 'help', description: 'Show help information' },
    ];

    return this.bot.telegram.setMyCommands(commands);
  }

  async handleHelp(ctx: Context) {
    return ctx.reply(await this.appConfigService.get('botHelp'));
  }

  async sendMessage(
    telegramId: string, 
    message: string,
    button?: { url: string; text: string }
  ) {
    try {
      const keyboard = button ? {
        reply_markup: {
          inline_keyboard: [[{ text: button.text, url: button.url }]]
        }
      } : undefined;

      const result = await this.bot.telegram.sendMessage(telegramId, message, keyboard)
        .catch(async err => {
          if (this.isTelegramBlockedError(err)) {
            this.logger.warn(`User ${telegramId} blocked the bot`);
            throw err;
          }
          throw err;
        });

      return result;
    } catch (error: any) {
      this.logger.error(`Error sending message to ${telegramId}:`, error);
      throw error;
    }
  }

  async sendPhoto(
    telegramId: string,
    photoUrl: string,
    caption: string,
    button?: { url: string; text: string }
  ) {
    try {
      const extra = {
        caption,
        parse_mode: 'HTML' as const,
        ...(button ? {
          reply_markup: {
            inline_keyboard: [[{ text: button.text, url: button.url }]]
          }
        } : {})
      };

      // If photoUrl is a URL, send it directly
      // If it's a local file path or buffer, we would need to handle it differently
      const result = await this.bot.telegram.sendPhoto(telegramId, photoUrl, extra)
        .catch(async err => {
          if (this.isTelegramBlockedError(err)) {
            this.logger.warn(`User ${telegramId} blocked the bot`);
            throw err;
          }
          throw err;
        });

      return result;
    } catch (error: any) {
      this.logger.error(`Error sending photo to ${telegramId}:`, error);
      throw error;
    }
  }

  isTelegramBlockedError(error: any): boolean {
    return error.response?.description?.includes('bot was blocked by the user') || 
           error.response?.description?.includes('user is deactivated') ||
           error.code === 403;
  }

  async setBotDescription() {
    return this.bot.telegram.setMyDescription(await this.appConfigService.get('botDescription'));
  }

  async setBotName() {
    return this.bot.telegram.setMyName(await this.appConfigService.get('botName'));
  }

  async setShortDescription() {
    return this.bot.telegram.setMyShortDescription(
      await this.appConfigService.get('botShortDescription'),
    );
  }
}
