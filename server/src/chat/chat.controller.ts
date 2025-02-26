import { Body, Controller, Post, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { anthropic} from '@ai-sdk/anthropic';
import { pipeDataStreamToResponse, streamText } from 'ai';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('chat')
export class ChatController {
  @Post('/')
  async root(@Body() chatRequest: ChatRequestDto, @Res() res: Response) {
    try {
      // Check if the API key is available
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new HttpException('ANTHROPIC_API_KEY is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const result = streamText({
        model: anthropic('claude-3-7-sonnet-latest'),
        prompt: chatRequest.prompt,
      });

      // Set appropriate headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      result.pipeDataStreamToResponse(res);
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }


  @Post('/stream-data')
  async streamData(@Body() chatRequest: ChatRequestDto, @Res() res: Response) {
    try {
      // Check if the API key is available
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new HttpException('ANTHROPIC_API_KEY is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Set appropriate headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      pipeDataStreamToResponse(res, {
        execute: async (dataStreamWriter) => {
          try {
            dataStreamWriter.writeData('initialized call');

            const result = streamText({
              model: anthropic('claude-3-7-sonnet-latest'),
              prompt: chatRequest.prompt,
            });

            result.mergeIntoDataStream(dataStreamWriter);
          } catch (execError) {
            console.error('Error in stream execution:', execError);
            throw execError;
          }
        },
        onError: (error) => {
          console.error('Stream error:', error);
          return error instanceof Error ? error.message : String(error);
        },
      });
    } catch (error) {
      console.error('Error in stream-data endpoint:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }
}
