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


}
