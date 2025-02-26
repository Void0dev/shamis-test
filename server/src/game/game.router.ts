import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc/trpc.service';
import { GameService } from './game.service';
import { Card, cards } from './types/cards';
import { Suite, suites } from './types/suites';

@Injectable()
export class GameRouter {
  constructor(
    private readonly gameService: GameService,
    private readonly trpcService: TrpcService,
  ) {}

  createRouter() {
    const protectedProcedure = this.trpcService.protectedProcedure;

    return this.trpcService.router({
      // Check if user has an active room
      hasRoom: protectedProcedure
        .query(async ({ ctx }) => {
          const room = await this.gameService.findRoomByUserId(ctx.user.id);
          return {
            hasRoom: !!room,
            roomId: room?.id || null,
            isPlayer1: room?.player1.id === ctx.user.id,
          };
        }),

      // Get all empty rooms available for joining
      getEmptyRooms: protectedProcedure
        .query(async () => {
          return await this.gameService.getEmptyRooms();
        }),

      // Get detailed information about a specific room
      getRoom: protectedProcedure
        .input(
          z.object({
            roomId: z.number(),
          }),
        )
        .query(async ({ input, ctx }) => {
          return await this.gameService.getRoomById(ctx.user.id, input.roomId);
        }),

      // Make a move in the game
      makeMove: protectedProcedure
        .input(
          z.object({
            roomId: z.number(),
            card: z.string().refine((val): val is Card => {
              return cards.includes(val as Card);
            }),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          return await this.gameService.makeMove(
            ctx.user.id,
            input.roomId,
            input.card,
          );
        }),

      // Finish the current move (collect cards from table)
      finishMove: protectedProcedure
        .input(
          z.object({
            roomId: z.number(),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          return await this.gameService.finishMove(
            ctx.user.id,
            input.roomId,
          );
        }),

      // Join a room
      joinRoom: protectedProcedure
        .input(
          z.object({
            roomId: z.number().optional(),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          if (input.roomId) {
            // Join existing room
            return await this.gameService.joinRoom(ctx.user.id, input.roomId);
          } else {
            // Create new room (trump will be randomly selected in the service)
            return await this.gameService.createRoom(ctx.user.id);
          }
        }),

      // Leave a room
      leaveRoom: protectedProcedure
        .input(
          z.object({
            roomId: z.number(),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          return await this.gameService.leaveRoom(ctx.user.id, input.roomId);
        }),
    });
  }
}
