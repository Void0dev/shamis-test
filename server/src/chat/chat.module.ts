import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';

@Module({
  controllers: [ChatController],
  providers: [],
  exports: [],
})
export class ChatModule {}
