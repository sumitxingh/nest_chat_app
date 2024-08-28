import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './user/auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, RouterModule } from '@nestjs/core';
import { UniqueConstraintExceptionFilter } from './common/filters/unique-constraint.exception-filter';
import { ConfigModule } from '@nestjs/config';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { MulterModule } from '@nestjs/platform-express';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { OperationModule } from './user/operation/operation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
    UserModule,
    AuthModule,
    RouterModule.register([
      {
        path: 'user',
        module: UserModule,
        children: [
          {
            path: 'auth',
            module: AuthModule
          },
          {
            path: 'operation',
            module: OperationModule,
            children: [
              {
                path: 'chat',
                module: ChatModule,
              }
            ]
          },
        ]
      }
    ]),
    MailModule,
    PrismaModule,
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './upload',
      }),
    }),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: UniqueConstraintExceptionFilter,
    },
  ],
})
export class AppModule { }
