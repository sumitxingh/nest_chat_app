// src/auth/auth.service.ts
import { JwtService } from '@nestjs/jwt';
import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '.prisma/client';
import { compare } from 'bcryptjs';
import { hash } from 'bcryptjs';
import { LoginRequestDto } from './dto/login_request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user_response.dto';
import { UpdateUserRequestDto } from './dto/update_user_request.dto';
import { join } from 'path';
import * as fs from 'fs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  private async findUserByUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { username: username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  private async validateUser(user: User, password: string): Promise<boolean> {
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return isPasswordValid;
  }

  async login(loginDto: LoginRequestDto) {
    const { username, password } = loginDto;
    let user = await this.findUserByUsername(username);
    await this.validateUser(user, password);
    const tokens = this.generateTokens(user.unique_id)
    const hashRefreshToken = await hash(tokens.refresh_token, 10);
    user = await this.prisma.user.update({
      where: {
        unique_id: user.unique_id
      },
      data: {
        refresh_token: hashRefreshToken
      }
    })
    const userResponse = plainToInstance(UserResponseDto, user)
    return { user: userResponse, tokens };
  }

  private generateTokens(id: string): { access_token: string; refresh_token: string } {
    const accessToken = this.generateAccessToken(id);
    const refreshToken = this.generateRefreshToken(id);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private generateAccessToken(id: string): string {
    return new JwtService({
      secret: process.env.JWT_SECRET || 'jwt-secret',
      signOptions: { expiresIn: '30min' },
    }).sign({ sub: id });
  }

  private generateRefreshToken(id: string): string {
    return new JwtService({
      secret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
      signOptions: { expiresIn: '60min' },
    }).sign({ sub: id });
  }


  async refreshToken(refreshToken: string, userId: string) {

    let user = await this.prisma.user.findUnique({ where: { unique_id: userId } })

    if (!user || !user.refresh_token)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await compare(refreshToken, user.refresh_token);

    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.generateTokens(user.unique_id);
    const hashRefreshToken = await hash(tokens.refresh_token, 10);
    user = await this.prisma.user.update({
      where: {
        unique_id: user.unique_id
      },
      data: {
        refresh_token: hashRefreshToken
      }
    })
    const userResponse = plainToInstance(UserResponseDto, user)
    return { user: userResponse, tokens };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserRequestDto, profilePicUrl?: string) {
    try {
      // Retrieve the existing user from the database
      const existingUser = await this.prisma.user.findUnique({ where: { unique_id: userId } });

      // Throw an exception if the user is not found
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Validate unique fields (username and email)
      await this.validateUniqueFields(updateUserDto, existingUser);

      // Hash the password if it is being updated
      if (updateUserDto.password) {
        updateUserDto.password = await hash(updateUserDto.password, 10);
      }

      // Update the profile picture URL if provided
      if (profilePicUrl) {
        updateUserDto.profile_pic = profilePicUrl;
      }

      // Update the user in the database with new data
      const updatedUser = await this.prisma.user.update({
        where: { unique_id: userId },
        data: {
          ...updateUserDto,
          updated_at: new Date(),
        },
      });

      // Handle old profile picture if a new one is uploaded
      if (profilePicUrl) {
        await this.handleProfilePic(existingUser.profile_pic, profilePicUrl);
      }

      // Return the updated user data as a DTO
      return plainToInstance(UserResponseDto, updatedUser);

    } catch (error) {
      // Rollback the uploaded profile picture if any error occurs
      if (profilePicUrl) {
        await this.rollbackProfilePic(profilePicUrl);
      }
      throw error;
    }
  }

  // Validate that the new username and email are unique
  private async validateUniqueFields(updateUserDto: UpdateUserRequestDto, existingUser: any) {
    const { username, email } = updateUserDto;

    // Check if the username is taken
    if (username && username !== existingUser.username) {
      const userWithSameUsername = await this.prisma.user.findUnique({ where: { username } });
      if (userWithSameUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    // Check if the email is taken
    if (email && email !== existingUser.email) {
      const userWithSameEmail = await this.prisma.user.findUnique({ where: { email } });
      if (userWithSameEmail) {
        throw new ConflictException('Email already exists');
      }
    }
  }

  // Handle deletion of the old profile picture
  private async handleProfilePic(oldProfilePic: string, newProfilePicUrl: string) {
    if (oldProfilePic) {
      const oldProfilePicPath = join(__dirname, '..', '..', 'upload', oldProfilePic);
      try {
        await fs.promises.unlink(oldProfilePicPath);
        console.log(`Successfully deleted old profile picture: ${oldProfilePic}`);
      } catch (err) {
        console.error('Error deleting old profile picture:', err);
      }
    }
  }

  // Rollback the new profile picture if an error occurs
  private async rollbackProfilePic(profilePicUrl: string) {
    const profilePicPath = join(__dirname, '..', '..', 'upload', profilePicUrl);
    try {
      await fs.promises.unlink(profilePicPath);
      console.log(`Successfully rolled back profile picture: ${profilePicUrl}`);
    } catch (err) {
      console.error('Error rolling back profile picture:', err);
    }
  }

  async registerUser(createUserDto: CreateUserDto): Promise<any> {
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



}
