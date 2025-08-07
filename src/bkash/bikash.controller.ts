// bkash.controller.ts
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { BikashService } from './bikash.service';
import { Response } from 'express';

@Controller('bikash')
export class BikashController {
  constructor(private readonly bikashService: BikashService) {}

  @Post('create')
  createPayment(@Body() body: { amount: string; invoice: string }) {
    return this.bikashService.createPayment(
      parseInt(body.amount),
      body.invoice,
    );
  }

  @Get('execute')
  executePayment(
    @Query() query: { paymentID: string; status: string; payID: string },
    @Res() res: Response,
  ) {
    return this.bikashService.executePayment(
      query.paymentID,
      query.status,
      query.payID,
      res,
    );
  }
}
