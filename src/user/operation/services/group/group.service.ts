import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateGroupRequestDTO } from "../../dto/update_group_request.dt";
import { handleProfilePic, rollbackProfilePic } from "src/common/functions/utils.function";
import { Group, User } from "@prisma/client";

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) { }

  async createNewGroup(name: string, description: string, creatorId: string) {
    try {
      const group = await this.createGroup(name, description, creatorId);
      const conversation = await this.createConversationRecord(group.unique_id);
      await this.addUserAsParticipants(creatorId, conversation.unique_id);

      return group;
    } catch (error) {
      console.log(error);
      // Handle or log error appropriately
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }

  async getUserGroups(userId: string) {
    return this.prismaService.group.findMany({
      where: {
        conversation: {
          participants: {
            some: {
              user_id: userId,
            },
          },
        }
      },
    });
  }

  async getMyGroups(userId: string) {
    const allGroups = await this.prismaService.group.findMany({
      where: {
        created_by: userId,
      },
      include: {
        conversation: {
          select: {
            _count: {
              select: {
                participants: true
              }
            }
          }
        }
      }
    });

    const updateGroups = allGroups.map((group) => {
      const participantsCount = group.conversation._count.participants
      delete group.conversation
      return {
        ...group,
        participants_count: participantsCount
      }
    })

    return updateGroups;
  }

  async getGroupDetail(groupId: string, userId: string) {
    const group = await this.prismaService.group.findUnique({
      where: {
        unique_id: groupId,
        created_by: userId,
      },
    });

    const groupUser = await this.prismaService.user.findMany({
      where: {
        Participants: {
          some: {
            conversation_id: group.conversation_id
          }
        }
      },
      select: {
        unique_id: true,
        username: true,
        profile_pic: true,
        full_name: true,
      }
    })

    return { group, users: groupUser }
  }

  private async createGroup(name: string, description: string, creatorId: string) {
    console.log({ name, description, creatorId })
    const userExists = await this.prismaService.user.findUnique({
      where: { unique_id: creatorId },
    });

    if (!userExists) {
      throw new Error(`User with ID ${creatorId} does not exist`);
    }

    const group = await this.prismaService.$transaction(async (prisma) => {
      const conversation = await prisma.conversation.create({
        data: {
          is_group: true,
        },
      })

      const participant = await prisma.participants.create({
        data: {
          user_id: creatorId,
          conversation_id: conversation.unique_id,
        }
      })

      const group = await prisma.group.create({
        data: {
          name,
          description,
          created_by: creatorId,
          conversation_id: conversation.unique_id
        },
      });
      return group;
    })

    return group;
  }

  async addUserToGroup(groupId: string, userId: string, currentUser: User) {
    try {
      const group = await this.findGroupById(groupId);
      if (group.created_by !== currentUser.unique_id) {
        throw new Error('Only group creator can add users');
      }
      const existUser = await this.findUserById(userId);
      await this.addUserAsParticipants(existUser.unique_id, group.conversation_id);
      return group;
    } catch (error) {
      console.log(error);
    }
  }

  async removeUserFromGroup(groupId: string, userId: string, currentUser: User) {
    try {
      const group = await this.findGroupById(groupId);
      if (group.created_by !== currentUser.unique_id) {
        throw new Error('Only group creator can remove users');
      }
      const existUser = await this.findUserById(userId);
      if (group.created_by)
        await this.prismaService.participants.delete({
          where: {
            user_id_conversation_id: {
              user_id: existUser.unique_id,
              conversation_id: group.conversation_id,
            },
          },
        });
      return { group, existUser };
    } catch (error) {
      console.log(error);
    }
  }

  async updateGroup(updateGroupDto: UpdateGroupRequestDTO, groupPicUrl?: string) {
    try {
      // Retrieve the existing group from the database
      const existingGroup = await this.prismaService.group.findUnique({ where: { unique_id: updateGroupDto.unique_id } });

      // Throw an exception if the group is not found
      if (!existingGroup) {
        throw new NotFoundException('Group not found');
      }

      // Update the profile picture URL if provided
      if (groupPicUrl) {
        updateGroupDto.group_pic = groupPicUrl;
      }

      // Update the group in the database with new data
      const updatedGroup = await this.prismaService.group.update({
        where: { unique_id: existingGroup.unique_id },
        data: {
          ...updateGroupDto,
        },
      });

      // Handle old profile picture if a new one is uploaded
      if (groupPicUrl) {
        await handleProfilePic(existingGroup.group_pic, groupPicUrl);
      }


      return updateGroupDto

    } catch (error) {
      // Rollback the uploaded profile picture if any error occurs
      if (groupPicUrl) {
        await rollbackProfilePic(groupPicUrl);
      }
      throw error;
    }
  }

  private async createConversationRecord(groupId: string) {
    return this.prismaService.conversation.create({
      data: {
        is_group: true,
        Group: {
          connect: {
            unique_id: groupId
          }
        }
      }
    });
  }

  private async addUserAsParticipants(userId: string, conversationId: string) {
    return this.prismaService.participants.create({
      data: {
        user_id: userId,
        conversation_id: conversationId
      }
    });
  }

  private async findGroupById(groupId: string): Promise<Group> {
    const group = await this.prismaService.group.findUnique({
      where: { unique_id: groupId },
    })

    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  private async findUserById(userId: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { unique_id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}