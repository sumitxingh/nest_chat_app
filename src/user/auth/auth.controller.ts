import { Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { LoginRequestDto } from './dto/login_request.dto';
import { AuthService } from './auth.service';
import { GetCurrentUser } from 'src/decorator/currentUser.decorator';
import { RefreshTokenGuard } from './guards/refresh_token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { format } from 'date-fns';
import { UpdateUserRequestDto } from './dto/update_user_request.dto';
import { AccessTokenGuard } from './guards/access_token.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly userService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginRequestDto) {
    return this.userService.login(loginDto).then((user) => {
      return {
        data: user,
        meta: {
          message: 'User logged in successfully',
          type: 'loginResponseDto',
        }
      };
    })
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refresh(@GetCurrentUser('refreshToken') refreshToken: string, @GetCurrentUser('sub') userId: string) {
    return this.userService.refreshToken(refreshToken, userId).then((user) => {
      return {
        data: user,
        meta: {
          message: 'Token refresh successfully',
          type: 'refreshResponseDto',
        }
      };
    })
  }


  @Put('profile')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('profile_pic', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          const fileExtName = extname(file.originalname);
          const currentDate = format(new Date(), 'yyyyMMddhhmmss');
          const newFileName = `profile_pic_${currentDate}${fileExtName}`;
          cb(null, newFileName);
        },
      }),
    }),
  )
  async updateUser(
    @GetCurrentUser('unique_id') userId: string,
    @Body() updateUserDto: UpdateUserRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const profilePicUrl = file ? `${file.filename}` : undefined;
    return this.userService.updateUser(userId, updateUserDto, profilePicUrl).then((updatedUser) => {
      return {
        data: updatedUser,
        meta: {
          message: 'User profile updated successfully',
          type: 'UserUpdatedResponseDto',
        }
      };
    })
  }

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerUser(createUserDto).then((user) => {
      return {
        data: user,
        meta: {
          message: 'User created successfully',
          type: 'UserRegisterResponseDto',
        }
      };
    })
  }

}
