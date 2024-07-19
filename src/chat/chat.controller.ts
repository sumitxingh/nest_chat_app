import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('create-group')
  async createGroup(@Body() createGroupDto: { name: string; description?: string; creatorId: string }) {
    return this.chatService.createNewGroup(createGroupDto.name, createGroupDto.description, createGroupDto.creatorId);
  }

  @Get('groups/:userId')
  async getUserGroups(@Param('userId') userId: string) {
    return this.chatService.getUserGroups(userId).then((groups) => {
      return {
        data: groups,
        meta: {
          message: 'All User Groups',
          type: 'groupsResponseDTO',
        }
      }
    })
  }

  @Get('messages')
  async getAllMessages() {
    // const allMessage = await this.chatService.getAllMessages();
    return {
      data: 'allMessage',
      meta: {
        message: 'All messages',
        type: 'allMessagesResponseDto',
      }
    };
  }

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
