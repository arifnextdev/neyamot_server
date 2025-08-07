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
} from '@nestjs/common';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { UpdateUserDto } from 'src/auth/dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/admin/create')
  createAdmin(@Body() data: any) {
    return this.userService.createUser(data);
  }

  @Get()
  getAllUser(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getAllUser({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      status,
      role,
      search,
    });
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get(':id/orders')
  getOrdersByUserId(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getOrdersByUserId(
      id,
      Number(page) || 1,
      Number(limit) || 10,
      status,
      search,
    );
  }

  @Get(':id/transactions')
  getTransactionsByUserId(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.userService.getTransactionsByUserId(
      id,
      Number(page) || 1,
      Number(limit) || 10,
      status,
    );
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.userService.updateUser(id, data);
  }

  @Patch(':id/status')
  activateUser(@Param('id') id: string, @Body() data: { status: string }) {
    return this.userService.toggleUserStatus(id, data.status);
  }

  @Patch(':id/roles')
  deactivateUser(@Param('id') id: string, @Body() data: { roles: string[] }) {
    return this.userService.changeUserRole(id, data.roles);
  }

  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() data: ResetPasswordDto) {
    return this.userService.resetPassword(id, data);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
