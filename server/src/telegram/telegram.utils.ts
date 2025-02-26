import { Context } from 'telegraf';

export function getContextPayload(ctx: Context): string | undefined {
  return 'payload' in ctx && ctx.payload ? ctx.payload as string : undefined;
}
