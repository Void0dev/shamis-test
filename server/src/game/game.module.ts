import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { Room } from './room.entity';
import { GameRouter } from './game.router';
import { TrpcModule } from '../trpc/trpc.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    forwardRef(() => TrpcModule),
  ],
  providers: [GameService, GameRouter],
  exports: [GameService, GameRouter],
})
export class GameModule {}
