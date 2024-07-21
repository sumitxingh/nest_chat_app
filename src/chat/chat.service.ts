import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';


@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) { }

  async handlePrivateMessage(data: { from: string; to: string; message: string, conversationId: string }) {
    const sender = await this.prismaService.user.findUnique({ where: { username: data.from } });
    // Create the message
    await this.prismaService.message.create({
      data: {
        conversation_id: data.conversationId,
        sender_id: sender.unique_id,
        content: data.message,
      },
    });
  }

  async getConversationId(data: { from: string, to: string }): Promise<string> {
    const { from, to } = data;
    const usernames = [from, to];

    // Check if the conversation already exists
    const existingConversation = await this.prismaService.conversation.findFirst({
      where: {
        is_group: false,
        participants: {
          every: {
            user: {
              username: { in: usernames }
            }
          }
        }
      },
      include: {
        participants: true
      }
    });

    // If the conversation exists, return its ID
    if (existingConversation) {
      return existingConversation.unique_id;
    }

    // Otherwise, create a new conversation
    const newConversation = await this.prismaService.conversation.create({
      data: {
        is_group: false,
        participants: {
          create: [
            { user: { connect: { username: from } } },
            { user: { connect: { username: to } } }
          ]
        }
      },
      include: {
        participants: true
      }
    });

    console.log(newConversation);
    return newConversation.unique_id;
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

  async addUserToGroup(groupId: string, userId: string) {
    try {
      const group = await this.findGroupById(groupId);
      const existUser = await this.findUserById(userId);
      await this.addUserAsParticipants(existUser.unique_id, group.conversation_id);
      return group;
    } catch (error) {
      console.log(error);
    }
  }

  async removeUserFromGroup(groupId: string, userId: string) {
    try {
      const group = await this.findGroupById(groupId);
      const existUser = await this.findUserById(userId);
      await this.prismaService.participants.delete({
        where: {
          user_id_conversation_id: {
            user_id: existUser.unique_id,
            conversation_id: group.conversation.unique_id,
          },
        },
      });
      return { group, existUser };
    } catch (error) {
      console.log(error);
    }
  }

  async sendMessageToGroup(groupId: string, senderId: string, content: string) {
    const group = await this.findGroupById(groupId);

    const message = await this.prismaService.message.create({
      data: {
        content,
        sender_id: senderId,
        conversation_id: group.conversation.unique_id,
      },
    });

    return { message, group };
  }

  private async findGroupById(groupId: string) {
    const group = await this.prismaService.group.findUnique({
      where: { unique_id: groupId },
      include: { conversation: true }
    })

    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
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

  private async findUserById(userId: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { unique_id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


}
