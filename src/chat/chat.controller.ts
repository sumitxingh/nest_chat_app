import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AccessTokenGuard } from 'src/user/auth/guards/access_token.guard';
import { User } from '@prisma/client';
import { GetCurrentUser } from 'src/decorator/currentUser.decorator';

@Controller()
@UseGuards(AccessTokenGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('create-group')
  async createGroup(@Body() createGroupDto: { name: string; description?: string; creatorId: string }) {
    return this.chatService.createNewGroup(createGroupDto.name, createGroupDto.description, createGroupDto.creatorId);
  }

  @Get('groups')
  async getUserGroups(@GetCurrentUser() user: User) {
    return this.chatService.getUserGroups(user.unique_id).then((groups) => {
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
