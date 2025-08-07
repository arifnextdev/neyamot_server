import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderSchema,
  GetFilterDto,
  GetOrderDto,
  OrederCreateDto,
} from '../common/dto/order.dto';
import { ZodValidationPipe } from '../common/zodValidationPipe';
import {
  AdminOrderCreateDto,
  adminOrderCreateSchema,
} from '../common/dto/admin.order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/roles/guards';
import { Role } from '@prisma/client';
import { Roles } from 'src/roles/decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll(@Query() query: GetOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  createOrder(@Body() data: OrederCreateDto) {
    return this.orderService.createOrder(data);
  }

  @Post('/admin')
  // @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UsePipes(new ZodValidationPipe(adminOrderCreateSchema))
  createOrderAdmin(@Body() data: AdminOrderCreateDto) {
    return this.orderService.createOrderAdmin(data);
  }

  @Put('/admin/:id/metadata')
  // @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  updateOrderMetadata(@Body() metadata: any, @Param('id') id: string) {
    return this.orderService.updateOrderMetadata(id, metadata);
  }

  @Patch(':id/status')
  updateOrderStatus(@Body() status: string, @Param('id') id: string) {
    return this.orderService.updatedOrderStatus(id, status);
  }

  @Put(':id')
  updateOrder(@Param('id') id: string) {
    return this.orderService.updateOrder(id);
  }

  @Delete(':id')
  deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }

  @Get('/transection/details')
  getTransaction(@Query() query: GetFilterDto) {
    return this.orderService.getTransaction(query);
  }
}
