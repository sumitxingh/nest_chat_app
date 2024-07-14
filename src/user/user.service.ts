import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/user/auth/dto/user_response.dto';
import { Message } from '@prisma/client';
import { MessageResponseDto } from './dto/message_response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const { username, password, email } = createUserDto;
    const hashedPassword = await hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });
    const userResponse = plainToInstance(UserResponseDto, user)
    return userResponse;
  }

  async findUserByUsername(username: string) {
    return this.prismaService.user.findUnique({ where: { username } });
  }

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async getAllUsers(usernaem: string) {
    const allUsers = await this.prismaService.user.findMany({ where: { NOT: { username: usernaem } } });
    const allUsersResponse = allUsers.map((user) => plainToInstance(UserResponseDto, user));
    return allUsersResponse
  }


  async getAllMessages(createUserDto: CreateUserDto): Promise<MessageResponseDto[]> {
    const allMessages = await this.prismaService.message.findMany({
      where: {
        conversation: {
          participants: {
            some: {
              user: {
                username: createUserDto.username
              }
            }
          }
        }
      },
      include: {
        sender: true,
        conversation: {
          include: {
            participants: {
              select: {
                user: {
                  select: {
                    username: true,
                    unique_id: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })
    console.log(`message api call`)


    const messages: MessageResponseDto[] = allMessages.map(item => ({
      from: item.sender.username,
      to: item.conversation.participants
        .find(participant => participant.user.username !== item.sender.username)?.user.username || '', // Get the other participant's username
      message: item.content,
      send_on: new Date(item.send_at)
    }));

    return messages;
  }
}
