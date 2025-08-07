import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  @Get(':id')
  async getPaymentById(@Param('id') id: string) {
    return this.payment.getPaymentById(id);
  }

  @Patch(':id/status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() data: { status: string },
  ) {
    return this.payment.updatePaymentStatus(id, data.status);
  }
}
