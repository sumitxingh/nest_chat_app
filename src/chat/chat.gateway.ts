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
      if (!user) {
        throw new Error("User not found");
      }

      this.connectedUsers.set(client.id, user.username);
      console.log(`Client ${client.id} connected as ${user.username}`);
      this.server.emit('users', Array.from(this.connectedUsers.values()));

      // Listen for typing events
      client.on('typing', (isTyping: boolean) => {
        this.server.emit('typing', { username: user.username, isTyping });
      });
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
