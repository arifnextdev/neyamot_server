// jobs.module.ts
import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { OrderModule } from '../product/order/order.module';
import { OrderReminderService } from './order-reminder/order-reminder.service';

@Module({
  imports: [OrderModule, MailModule],
  providers: [OrderReminderService],
})
export class JobsModule {}
