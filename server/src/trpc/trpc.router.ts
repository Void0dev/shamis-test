import { INestApplication, Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import * as trpcExpress from '@trpc/server/adapters/express';
import { AuthRouter } from '../auth/auth.router';
import { GameRouter } from '../game/game.router';
import type { Request, Response } from 'express';
import { TrpcContext } from './types/TrpcContext';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly authRouter: AuthRouter,
    private readonly gameRouter: GameRouter,
  ) {}

  createRouter() {
    return this.trpc.router({
      auth: this.authRouter.createRouter(),
      game: this.gameRouter.createRouter(),
    });
  }

  async applyMiddleware(app: INestApplication) {
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: this.createRouter(),
        createContext: ({ req, res }: { req: Request; res: Response }): TrpcContext => ({
          req,
          res,
          user: undefined,
        }),
      }),
    );
  }
}

export type AppRouter = ReturnType<TrpcRouter['createRouter']>;
