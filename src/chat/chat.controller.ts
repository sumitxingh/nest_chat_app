import { Controller, Get, Post, Body, Param, UseGuards, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AccessTokenGuard } from 'src/user/auth/guards/access_token.guard';
import { User } from '@prisma/client';
import { GetCurrentUser } from 'src/decorator/currentUser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { format } from 'date-fns';
import { UpdateGroupRequestDTO } from '../user/operation/dto/update_group_request.dt';

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
