import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BikashModule } from '../../bkash/bikash.module';
import { MailModule } from '../../mail/mail.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { TasksModule } from '../../tasks/tasks.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MailModule,
    BikashModule,
    TasksModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService, HttpModule],
})
export class OrderModule {}
