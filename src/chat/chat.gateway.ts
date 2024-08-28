import { ChatService } from './chat.service';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this according to your needs
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly chatService: ChatService,
  ) { }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth.token?.toString();
      if (!token) {
        throw new Error("No token provided");
      }

      const payload = await this.jwtService.verifyAsync(token, { secret: 'jwt-secret' });
      if (!payload || !payload.sub) {
        throw new Error("Invalid token");
      }

      const user = await this.prismaService.user.findUnique({ where: { unique_id: payload.sub } });
      const allConversationIds = await this.prismaService.conversation.findMany({
        where: {
          participants: {
            some: {
              user_id: user.unique_id
            }
          }
        }
      })
      if (!user) {
        throw new Error("User not found");
      }

      this.connectedUsers.set(client.id, user.username);
      // console.log session id and user id
      console.log(client.handshake.auth)
      console.log(`Client ${client.id} connected as ${user.username}`);
      allConversationIds.forEach((conversation) => {
        client.join(conversation.unique_id)
        // console.log(`${user.username} join ${conversation.unique_id}`)
      })
      this.server.emit('users', Array.from(this.connectedUsers.values()));

      // Listen for typing events
      client.on('typing', (isTyping: boolean) => {
        this.server.emit('typing', { username: user.username, isTyping });
      });

      // public message
      client.on('message', async (data: { from: string, to: string, message: string, send_on: Date }) => {

        this.server.emit('receive-message', { from: user.username, to: data.to, message: data.message, send_on: data.send_on });
      });

      client.on('private-message', async (data: { from: string, to: string, message: string, send_on: Date }) => {
        const toClient = await this.prismaService.user.findUnique({ where: { username: data.to } });
        let { conversationId, create } = await this.chatService.getConversationId({ from: data.from, to: data.to })
        const room = conversationId
        console.log({ conversationId, create })
        if (create) {
          const recipientSocketId = Array.from(this.connectedUsers.entries()).find(([, username]) => username === data.to)?.[0];
          console.log(recipientSocketId)
          if (recipientSocketId) {
            // Join the recipient to the same room
            this.server.sockets.sockets.get(recipientSocketId)?.join(room);
            console.log(`recipientSocketId: ${recipientSocketId} joined to ${room}`)
          }
        }

        if (toClient) {
          this.server.to(room).emit('receive-private-message', { from: data.from, to: data.to, message: data.message, send_on: data.send_on });
          await this.chatService.handlePrivateMessage({ from: user.username, to: data.to, message: data.message, conversationId });
        } else {
          client.emit('private-message-error', { message: 'Recipient not found' });
        }
      });


      client.on('group-message', async (data: { from: string, to: string, message: string, send_on: Date }) => {
        console.log({ from: data.from, to: data.to, message: data.message, send_on: data.send_on })
        const group = await this.prismaService.group.findUnique({
          where: {
            unique_id: data.to
          },
          select: {
            unique_id: true,
            conversation_id: true,
            conversation: {
              select: {
                participants: {
                  select: {
                    unique_id: true,
                    user: {
                      select: {
                        unique_id: true,
                        username: true
                      }
                    }
                  }
                }
              }
            }
          }
        })

        // console.log(group)

        if (group) {
          //   // const room = `group-room-${group.conversation_id}`; // Unique room identifier
          const room = group.conversation_id
          console.log(`room ${room}`)
          this.server.to(room).emit('receive-group-message', { from: user.username, to: data.to, message: data.message, send_on: data.send_on })
          console.log(`Message sent to room ${room}: ${data.message}`);
          await this.chatService.sendMessageToGroup(data.to, user.unique_id, data.message);
        } else {
          client.emit('group-message-error', { message: 'Conversation not found' });
        }
      })



    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.error(`Token expired: ${error.message}`);
        client.emit('token-expired');
      } else {
        console.error(`Connection error: ${error.message}`);
      }
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const username = this.connectedUsers.get(client.id);
    if (username) {
      this.connectedUsers.delete(client.id);
      console.log(`Client ${client.id} (${username}) disconnected`);
      this.server.emit('users', Array.from(this.connectedUsers.values()));
    }
  }
}
