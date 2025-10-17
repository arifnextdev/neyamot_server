import { Module } from '@nestjs/common';
import { BikashService } from './bikash.service';
import { BikashController } from './bikash.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { TasksModule } from '../tasks/tasks.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, TasksModule, MailModule],
  providers: [BikashService, PrismaService],
  controllers: [BikashController],
  exports: [BikashService],
})
export class BikashModule {}
