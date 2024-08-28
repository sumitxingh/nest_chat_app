import { Body, Controller, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { GroupService } from "../../services/group/group.service";
import { GetCurrentUser } from "src/decorator/currentUser.decorator";
import { User } from "@prisma/client";
import { AccessTokenGuard } from "src/user/auth/guards/access_token.guard";
import { diskStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { extname } from "path";
import { format } from "date-fns";
import { UpdateGroupRequestDTO } from "../../dto/update_group_request.dt";

@Controller()
@UseGuards(AccessTokenGuard)
export class GroupController {
  constructor(private groupService: GroupService) { }

  @Post('create-group')
  async createGroup(@Body() createGroupDto: { name: string; description?: string; creatorId: string }) {
    return this.groupService.createNewGroup(createGroupDto.name, createGroupDto.description, createGroupDto.creatorId).then((group) => {
      return {
        data: group,
        meta: {
          message: 'Group created successfully',
          type: 'createGroupResponseDTO',
        }
      }
    })
  }

  @Put('update-group')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('group_pic', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          const fileExtName = extname(file.originalname);
          const currentDate = format(new Date(), 'yyyyMMddhhmmss');
          const newFileName = `group_pic_${currentDate}${fileExtName}`;
          cb(null, newFileName);
        },
      }),
    }),
  )
  async updateGroup(
    @GetCurrentUser('unique_id') userId: string,
    @Body() updateGroupDto: UpdateGroupRequestDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const groupPicUrl = file ? `${file.filename}` : undefined;
    return this.groupService.updateGroup(userId, updateGroupDto, groupPicUrl).then((updatedGroup) => {
      return {
        data: updatedGroup,
        meta: {
          message: 'Group updated successfully',
          type: 'GroupUpdatedResponseDto',
        }
      };
    })
  }

  @Get('groups')
  async getUserGroups(@GetCurrentUser() user: User) {
    return this.groupService.getUserGroups(user.unique_id).then((groups) => {
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
    return this.groupService.getMyGroups(user.unique_id).then((groups) => {
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
    return this.groupService.getGroupDetail(groupId, user.unique_id).then((group) => {
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
  async addUserToGroup(@Body() addUserToGroupDto: { groupId: string; userId: string }, @GetCurrentUser() currentUser: User) {
    return this.groupService.addUserToGroup(addUserToGroupDto.groupId, addUserToGroupDto.userId, currentUser).then((data) => {
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
  async removeUserFromGroup(@Body() removeUserFromGroupDto: { groupId: string; userId: string }, @GetCurrentUser() currentUser: User) {
    return this.groupService.removeUserFromGroup(removeUserFromGroupDto.groupId, removeUserFromGroupDto.userId, currentUser).then((data) => {
      return {
        data: data,
        meta: {
          message: 'User removed from group successfully',
          type: 'removeUserFromGroupResponseDto',
        }
      }
    })
  }


}