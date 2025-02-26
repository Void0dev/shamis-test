import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse, validate } from '@telegram-apps/init-data-node';
import { z } from 'zod';
import { TrpcService } from '../trpc/trpc.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthRouter {
  constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly trpcService: TrpcService,
  ) { }

  createRouter() {
    const publicProcedure = this.trpcService.procedure;
    const protectedProcedure = this.trpcService.protectedProcedure;

    return this.trpcService.router({
      telegramAuth: publicProcedure
        .input(z.object({ initData: z.string(), localTime: z.string() }))
        .mutation(async ({ input }) => {
          validate(input.initData, this.configService.get('TELEGRAM_BOT_TOKEN')!);

          const parsedData = parse(input.initData);
          const userData = parsedData.user;
          if (!userData) {
            throw new Error('Missing User');
          }

          let user = await this.userService.findByTelegramId(userData.id.toString());
          if (!user) {
            user = await this.userService.createUserFromTelegram({
              telegramId: userData.id.toString(),
              firstName: userData.firstName,
              lastName: userData.lastName || null,
              username: userData.username || null,
              localTime: new Date(input.localTime),
              languageCode: null,
              tonAddress: null,
              isAdmin: false,
              avatarUrl: userData.photoUrl || null,
              ref: parsedData.startParam || null,
            });
          }

          if (
            user.avatarUrl !== userData.photoUrl ||
                        user.firstName !== userData.firstName ||
                        user.lastName !== userData.lastName ||
                        user.username !== userData.username
          ) {
            await this.userService.updateUser(user.id, {
              avatarUrl: userData.photoUrl || null,
              firstName: userData.firstName || null,
              lastName: userData.lastName || null,
              username: userData.username || null,
            });
          }

          const token = await this.authService.generateToken(user.id);

          return {
            token,
            user: {
              id: user.id,
              telegramId: user.telegramId,
              username: user.username,
              avatarUrl: user.avatarUrl,
              firstName: user.firstName,
              lastName: user.lastName,
              languageCode: user.languageCode,
              tonAddress: user.tonAddress,
            },
          };
        }),

      setLanguage: protectedProcedure
        .input(z.object({ languageCode: z.string() }))
        .mutation(async ({ input, ctx }) => {
          await this.userService.setLanguageCode(ctx.user.id, input.languageCode);
        }),

      connectWallet: protectedProcedure
        .input(
          z.object({
            tonAddress: z.string(),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          await this.userService.setTonAddress(ctx.user.id, input.tonAddress);
        }),
    });
  }
}
