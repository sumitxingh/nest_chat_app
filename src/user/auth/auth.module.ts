import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './strategy/access_token.strategy';
import { RefreshTokenStrategy } from './strategy/refresh_token.strategy';


@Module({
  providers: [AuthService, PrismaService, JwtService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController]
})
export class AuthModule { }