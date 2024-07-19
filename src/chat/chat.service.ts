import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
        // participants: {
        //   some: {
        //     user_id: userId,
        //   },
        // },
      },
      // include: {
      //   conversation: true,
      // },
    });
  }

  async createNewGroup(name: string, description: string, creatorId: string) {
    try {
      const group = await this.createGroup(name, description, creatorId);
      const conversation = await this.createConversationRecord(group.unique_id);
      await this.addUserAsParticipants(creatorId, conversation.unique_id);

      return group;
    } catch (error) {
      // Handle or log error appropriately
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }

  async addUserToGroup(groupId: string, userId: string) {

    const group = await this.findGroupById(groupId);

    await this.addUserAsParticipants(userId, group.unique_id);

    return group;
  }

  async removeUserFromGroup(groupId: string, userId: string) {
    const group = await this.findGroupById(groupId);
    
    await this.prismaService.participants.delete({
      where: {
        user_id_conversation_id: {
          user_id: userId,
          conversation_id: group.conversation.unique_id,
        },
      },
    });

    return group;
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

  private async findGroupById(groupId: string){
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
    return this.prismaService.group.create({
      data: {
        name,
        description,
        created_by: creatorId
      }
    });
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


}
