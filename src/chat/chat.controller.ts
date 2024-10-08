import { Controller, Get, Post, Body, Param, UseGuards, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AccessTokenGuard } from 'src/user/auth/guards/access_token.guard';

@Controller()
@UseGuards(AccessTokenGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('create-group')
  async createGroup(@Body() createGroupDto: { name: string; description?: string; creatorId: string }) {
    return this.chatService.createNewGroup(createGroupDto.name, createGroupDto.description, createGroupDto.creatorId).then((group) => {
      return {
        data: group,
        meta: {
          message: 'Group created successfully',
          type: 'createGroupResponseDTO',
        }
      }
    })
  }

  @Get('messages')
  async getAllMessages() {
    return {
      data: 'allMessage',
      meta: {
        message: 'All messages',
        type: 'allMessagesResponseDto',
      }
    };
  }

}
