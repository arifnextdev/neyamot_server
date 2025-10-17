// bkash.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class BikashService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taskService: TasksService,
    private readonly mailService: MailService,
  ) {}
  private readonly baseURL = process.env.BKASH_BASE_URL;
  private readonly appKey = process.env.BKASH_APP_KEY;
  private readonly appSecret = process.env.BKASH_APP_SECRET;
  private readonly username = process.env.BKASH_USERNAME;
  private readonly password = process.env.BKASH_PASSWORD;
  // Test Sandbox
  private readonly createUrl = process.env.bkash_create_payment_url;
  private readonly executeUrl = process.env.bkash_execute_payment_url;
  private readonly cancelUrl = process.env.bkash_refund_transaction_url;

  private token: string;

  async getToken(): Promise<string> {
    const res = await axios.post(
      `${this.baseURL}/checkout/token/grant`,
      {
        app_key: this.appKey,
        app_secret: this.appSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          username: this.username,
          password: this.password,
        },
      },
    );

    this.token = res.data.id_token;

    return this.token;
  }

  async createPayment(amount: number, payID: string) {
    const token = await this.getToken();

    try {
      const res = await axios.post(
        `${this.createUrl}`,
        {
          amount,
          mode: '0011',
          currency: 'BDT',
          payerReference: '1234',
          intent: 'sale',
          merchantInvoiceNumber: payID,
          callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/bikash/execute/?payID=${payID}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: token,
            'x-app-key': this.appKey,
          },
        },
      );

      return res.data;
    } catch (error) {
      console.log(error);
      return {
        message: 'Something went wrong',
      };
    }
  }

  async executePayment(
    paymentID: string,
    status: string,
    payID: string,
    res: Response,
  ) {
    if (status === 'cancel' || status === 'failure') {
      const existingPayment = await this.prisma.payment.findUnique({
        where: { id: payID },
      });

      if (!existingPayment) {
        throw new NotFoundException('Payment record not found');
      }

      await this.prisma.payment.update({
        where: { id: payID },
        data: { status: 'FAILED' },
      });
      console.log(
        `Payment ${payID} cancelled or failed with status: ${status}`,
      );
      // this.taskService.queueEmail({
      //   to: 'arif@gmail.com',
      //   subject: 'Payment Failed',
      //   text: `Your payment with ID ${payID} has been cancelled or failed with status: ${status}.`,
      // });
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/error?message=${status}&payID=${payID}`,
      );

      // this.taskService.queueEmail({
      //   to: 'arif@gmail.com',
      //   subject: 'Payment Failed',
      //   text: `Your payment with ID ${payID} has been cancelled or failed with status: ${status}.`,
      // });
      return;
    }

    if (status === 'success') {
      try {
        const { data } = await axios.post(`${this.executeUrl}`, { paymentID });

        if (data && data.statusCode === '0000') {
          const payment = await this.prisma.payment.update({
            where: { id: payID },
            data: {
              status: 'SUCCESS',
              transId: data.trxID,
              paidAt: data.updateTime,
              metadata: {
                paymentId: data.paymentID,
                createTime: data.createTime,
                transactionStatus: data.transactionStatus,
                merchantInvoiceNumber: data.merchantInvoiceNumber,
                intent: data.intent,
              },
            },
            select: {
              id: true,
              status: true,
              amount: true,
              paidAt: true,
              createdAt: true,
              method: true,
              currency: true,
              transId: true,
              tax: true,
              vat: true,
              discount: true,
              subtotal: true,
              order: {
                include: {
                  product: true,
                  user: {
                    select: {
                      id: true,
                      email: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });

          if (payment.order.product.type === 'HOSTING') {
            if (
              payment.order.metadata &&
              typeof payment.order.metadata === 'object' &&
              'userName' in payment.order.metadata
            ) {
              const userName = payment.order.metadata.userName;
              const password = payment.order.metadata.password;
              const plan = payment.order.metadata.plan;
              if (
                typeof userName === 'string' &&
                typeof password === 'string' &&
                typeof plan === 'string'
              ) {
                this.taskService.queueCpanel({
                  userId: payment.order.user.id,
                  orderId: payment.order.id,
                  userName,
                  domain: data.domainName,
                  password: password,
                  email: payment.order.user.email,
                  plan: plan,
                });
              } else {
                // Handle the case where userName is not a string
              }
            }
          }

          this.taskService.queueEmail(payment.order.id);
          this.mailService.sendAdminAlertEmail(
            `Payment successful for order ${payment.order.id} from user ${payment.order.user.id} `,
            `Payment ID: ${payment.id}, Amount: ${payment.amount}, Status: ${payment.status}. Order Details: ${payment.order.domainName ? 'Domain Name: ' + payment.order.domainName : 'No Domain Name'} ${payment.order.product.name ? ', Product: ' + payment.order.product.name : ''} ${payment.order.product.type ? ', Type: ' + payment.order.product.type : ''}. User: ${payment.order.user.name} (${payment.order.user.email})`,
            payment.order.userId,
          );
          res.redirect(
            `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?message=${data.message}&payID=${payID}`,
          );
        }
      } catch (error) {
        console.log(error);
        res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/error?message=${error.message}&payID=${payID}`,
        );
      }
    }
  }
}
