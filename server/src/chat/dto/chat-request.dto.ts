import { IsNotEmpty, IsString } from '@nestjs/class-validator';

export class ChatRequestDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;
}
