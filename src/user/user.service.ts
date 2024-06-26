import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/user/auth/dto/user_response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const { username, password, email } = createUserDto;
    const hashedPassword = await hash(password, 10);
    const user = await this.prisma.user.create({
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
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getAllUsers() {
    const allUsers = await this.prisma.user.findMany({});
    const allUsersResponse = allUsers.map((user) => plainToInstance(UserResponseDto, user));
    return allUsersResponse
  }
}
