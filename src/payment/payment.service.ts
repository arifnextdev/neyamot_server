import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaymentById(id: string) {
    const paymentDetails = await this.prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        paidAt: true,
        method: true,
        currency: true,
        transId: true,
        tax: true,
        vat: true,
        discount: true,
        subtotal: true,
        orderId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            domainName: true,
            amount: true,
            expiresAt: true,
            product: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });
    return { ...paymentDetails };
  }

  async updatePaymentStatus(id: string, status: string) {
    //validate status
    const validStatuses = [
      'PENDING',
      'COMPLETED',
      'FAILED',
      'REFUNDED',
      'CANCELLED',
      'DUE',
      'SUCCESS',
    ];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    const exist = await this.prisma.payment.findUnique({ where: { id } });
    if (!exist) {
      throw new Error('Payment not found');
    }
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: status as PaymentStatus },
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
      },
    });
    return payment;
  }
}
