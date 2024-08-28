import { Module } from '@nestjs/common';
import { GroupService } from './services/group/group.service';
import { GroupController } from './controller/group/group.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [GroupController],
  providers: [GroupService, PrismaService],
  exports: [],
})
export class OperationModule { }
