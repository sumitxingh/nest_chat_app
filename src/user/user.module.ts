import { OperationModule } from './operation/operation.module';
import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    JwtModule.register({}),
    AuthModule,
    OperationModule
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UserModule { }
