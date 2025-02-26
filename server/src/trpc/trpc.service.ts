import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { TrpcContextProtected, TrpcContextPublic } from './types/TrpcContext';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TrpcService {
  constructor(private readonly authService: AuthService) {}

  trpc = initTRPC.context<TrpcContextPublic | TrpcContextProtected>().create({
    errorFormatter({ shape, error }) {
      console.error('TRPC Error:', error);
      
      // Возвращаем только безопасную информацию об ошибке
      return {
        ...shape,
        message: 'An unexpected error occurred',
        data: {
          ...shape.data,
          stack: undefined, // Убираем stack trace
          cause: undefined, // Убираем cause
        }
      };
    },
  });
  procedure = this.trpc.procedure;
  router = this.trpc.router;
  mergeRouters = this.trpc.mergeRouters;
  middleware = this.trpc.middleware;

  checkAuth = async (ctx: TrpcContextPublic) => {
    if (!ctx.req.headers.authorization) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be authenticated to access this resource',
      });
    }

    const user = await this.authService.getUserByJWT(ctx.req.headers.authorization);
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      });
    }
    return user;
  };

  protectedProcedure = this.procedure.use(
    this.middleware(async ({ ctx, next }) => {
      const user = await this.checkAuth(ctx);
      return next({
        ctx: { ...ctx, user },
      });
    }),
  );
}
