import { Module } from '@nestjs/common';
import { BikashService } from './bikash.service';
import { BikashController } from './bikash.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, TasksModule, MailModule],
  providers: [BikashService, PrismaService],
  controllers: [BikashController],
  exports: [BikashService],
})
export class BikashModule {}
