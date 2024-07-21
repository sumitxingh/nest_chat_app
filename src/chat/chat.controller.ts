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

  @Get('my-groups')
  async getMyGroups(@GetCurrentUser() user: User) {
    return this.chatService.getMyGroups(user.unique_id).then((groups) => {
      return {
        data: groups,
        meta: {
          message: 'All my groups fetched successfully',
          type: 'groupsResponseDTO',
        }
      }
    })
  }
  @Get('group-detail/:id')
  async getGroupDetail(@Param('id') groupId: string, @GetCurrentUser() user: User) {
    return this.chatService.getGroupDetail(groupId, user.unique_id).then((group) => {
      return {
        data: group,
        meta: {
          message: 'Group detail fetched successfully',
          type: 'groupDetailResponseDTO',
        }
      }
    })
  }

  @Post('add-user-to-group')
  async addUserToGroup(@Body() addUserToGroupDto: { groupId: string; userId: string }) {
    return this.chatService.addUserToGroup(addUserToGroupDto.groupId, addUserToGroupDto.userId).then((data) => {
      return {
        data: data,
        meta: {
          message: 'User added to group successfully',
          type: 'addUserToGroupResponseDto',
        }
      }
    })
  }

  @Post('remove-user-from-group')
  async removeUserFromGroup(@Body() removeUserFromGroupDto: { groupId: string; userId: string }) {
    return this.chatService.removeUserFromGroup(removeUserFromGroupDto.groupId, removeUserFromGroupDto.userId).then((data) => {
      return {
        data: data,
        meta: {
          message: 'User removed from group successfully',
          type: 'removeUserFromGroupResponseDto',
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
