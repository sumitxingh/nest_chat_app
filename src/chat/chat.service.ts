import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) { }

  async handlePrivateMessage(data: { from: string; to: string; message: string }) {
    const sender = await this.prisma.user.findUnique({ where: { username: data.from } });
    const recipient = await this.prisma.user.findUnique({ where: { username: data.to } });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Check if conversation exists
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          some: { user: { username: data.to } },
        },
      },
    });

    let conversationId: string;

    if (!conversation) {
      // Create a new conversation if none exists
      const newConversation = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [
              { user: { connect: { username: data.to } } },
              { user: { connect: { username: data.from } } },
            ],
          },
        },
      });

      conversationId = newConversation.unique_id;

      // Create user-conversation associations for both users
      await this.prisma.userConversation.createMany({
        data: [
          {
            user_id: recipient.unique_id,
            conversation_id: conversationId,
          },
          {
            user_id: sender.unique_id,
            conversation_id: conversationId,
          },
        ],
      });
    } else {
      conversationId = conversation.unique_id;
    }

    // Create the message
    await this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: sender.unique_id,
        content: data.message,
      },
    });
  }



}
