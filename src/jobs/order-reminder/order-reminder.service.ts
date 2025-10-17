import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../../mail/mail.service';
import { OrderService } from '../../product/order/order.service';

@Injectable()
export class OrderReminderService {
  private readonly logger = new Logger(OrderReminderService.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleReminders() {
    this.logger.log('⏰ Running order reminder cron job');

    const today = new Date();
    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(today.getDate() + 5);

    // Orders expiring in 5 days
    const ordersToRemind =
      await this.orderService.getOrdersExpiringOn(fiveDaysLater);

    if (!ordersToRemind.length) {
      this.logger.log('No orders expiring in 5 days');
      return;
    }

    //Create Due Invoice
    ordersToRemind.forEach((order) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // await this.orderService.createDueInvoice(order);
    });

    ordersToRemind.forEach((order) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // await this.mailService.sendInvoiceReminder(order);
    });

    // Orders expiring today
    const expiringToday = await this.orderService.getOrdersExpiringOn(today);
    expiringToday.forEach((order) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // await this.mailService.sendExpiryNotice(order);
    });

    this.logger.log('✅ Reminder emails sent');
  }
}