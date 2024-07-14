import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [JwtModule.register({ secret: 'jwt-secret' })],
  providers: [ChatGateway, ChatService, PrismaService, JwtService],
  controllers: [ChatController]
})
export class ChatModule { }
