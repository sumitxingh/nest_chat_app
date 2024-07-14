import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  // @Get()
  // async getAllMessages() {
  //   const allMessage = await this.chatService.getAllMessages();
  //   return {
  //     data: allMessage,
  //     meta: {
  //       message: 'All messages',
  //       type: 'allMessagesResponseDto',
  //     }
  //   };
  // }

  // @Post()
  // async createMessage(@Body() body: { user: string, message: string }) {
  //   const message = await this.chatService.createMessage(body.user, body.message);
  //   return {
  //     data: message,
  //     meta: {
  //       message: 'Message created successfully',
  //       type: 'createMessageResponseDto',
  //     }
  //   };
  // }
}
