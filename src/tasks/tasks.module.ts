import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TasksService } from './tasks.service';
import { TasksWorker } from './tasks.processor';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'provision',
    }),
    MailModule,
  ],
  providers: [TasksWorker, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
