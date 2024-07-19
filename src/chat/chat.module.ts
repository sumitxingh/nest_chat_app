import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/user/auth/auth.module';

@Module({
  imports: [JwtModule.register({ secret: 'jwt-secret' }), AuthModule],
  providers: [ChatGateway, ChatService, PrismaService, JwtService],
  controllers: [ChatController]
})
export class ChatModule { }
