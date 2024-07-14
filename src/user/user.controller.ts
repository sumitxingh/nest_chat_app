import { Controller, Post, Body, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './user.service';
import { User } from '@prisma/client';
import { AccessTokenGuard } from 'src/user/auth/guards/access_token.guard';
import { GetCurrentUser } from 'src/decorator/currentUser.decorator';


@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return {
      data: user,
      meta: {
        message: 'User created successfully',
        type: 'createUserResponseDto',
      }
    };
  }

  @Get('all')
  @UseGuards(AccessTokenGuard)
  async getAllUsers(@GetCurrentUser() user: User) {
    const allUsers = await this.usersService.getAllUsers(user.username);
    return {
      data: allUsers,
      meta: {
        message: 'All users',
        type: 'allUsersResponseDto',
      }
    };
  }

  @Get('messages')
  @UseGuards(AccessTokenGuard)
  async getAllMessages(@GetCurrentUser() user: User) {
    const allMessages = await this.usersService.getAllMessages(user);
    return {
      data: allMessages,
      meta: {
        message: 'All messages',
        type: 'allMessagesResponseDto',
      }
    };
  }

}
