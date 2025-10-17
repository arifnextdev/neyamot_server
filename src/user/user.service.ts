import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto, CreateUserDto } from '../auth/dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { userUpdateSchema } from './dto/userUpdate.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existUser) {
      throw new NotFoundException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password || '', 10);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    if (!user) {
      throw new NotFoundException('User not created');
    }
    return {
      message: 'User created successfully',
    };
  }

  //Get all user
  async getAllUser({
    page = 1,
    limit = 10,
    status,
    role,
    search,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
    search?: string;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(role && { roles: { has: role } }), // for array roles
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          provider: true,
          roles: true,
          status: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      users,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalUsers: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    };
  }

  // Get a Single User by ID
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        roles: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userInfo: {
          select: {
            street: true,
            city: true,
            state: true,
            country: true,
            postalCode: true,
          },
        },
        loginHistories: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Get Orders by User ID
  async getOrdersByUserId(
    id: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const skip = (page - 1) * limit;

    let where: any = {
      userId: id,
      ...(status && { status }),
      ...(search && {
        OR: [
          { domainName: { contains: search, mode: 'insensitive' } },
          { product: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          domainName: true,
          amount: true,
          paidAt: true,
          expiresAt: true,
          status: true,
          product: { select: { name: true, type: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: orders,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalOrders: totalCount,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  // Get Payments by User ID
  async getTransactionsByUserId(
    id: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    let where: any = {
      userId: id,
      ...(status && { status }),
      ...(search && {
        OR: [{ transId: { contains: search, mode: 'insensitive' } }],
      }),
    };

    const [payments, totalCount] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          subtotal: true,
          paidAt: true,
          method: true,
          currency: true,
          transId: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: payments,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalPayments: totalCount,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  //Update a User by ID
  async updateUser(id: string, data: UpdateUserDto) {
    const parsebody = userUpdateSchema.safeParse(data);
    if (!parsebody.success) {
      throw new Error('Invalid data format');
    }

    const updateUser = await this.prisma.user.findUnique({ where: { id } });
    if (!updateUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        name: parsebody.data.name,
        phone: parsebody.data.phone,
        userInfo: {
          update: {
            street: parsebody.data.street,
            city: parsebody.data.city,
            state: parsebody.data.state,
            country: parsebody.data.country,
            postalCode: parsebody.data.postalCode,
          },
        },
      },
    });

    // await this.prisma.userInfo.upsert({
    //   where: { userId: id },
    //   update: {

    //   },
    //   create: {
    //     userId: id,
    //     street: parsebody.data.street,
    //     city: parsebody.data.city,
    //     state: parsebody.data.state,
    //     country: parsebody.data.country,
    //     postalCode: parsebody.data.postalCode,
    //   },
    // });
    return { message: 'User updated successfully' };
  }

  //Delete a User by ID
  async deleteUser(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }

  // Activate a user
  async toggleUserStatus(id: string, status: string) {
    const validStatuses = [
      'ACTIVE',
      'INACTIVE',
      'PENDING',
      'BANNED',
      'SUSPENDED',
    ];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    const exist = await this.prisma.user.findUnique({ where: { id } });
    if (!exist) {
      throw new NotFoundException('User not found');
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
    });
    return { message: 'User activated', user };
  }

  // Change user role
  async changeUserRole(id: string, roles: string[]) {
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error('Roles must be a non-empty array');
    }
    const validRoles = ['ADMIN', 'CUSTOMER', 'MODERATOR']; // Add more roles as needed
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }
    }
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        roles: roles as Role[],
      },
    });
    return { message: 'User role updated', user: updatedUser };
  }
  // Deactivate a user

  // Reset user password
  async resetPassword(id: string, data: ResetPasswordDto) {
    const hashedPassword = await bcrypt.hash(data.password || '', 10);
    const user = await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { message: 'Password reset successful', user };
  }

  //Delete a User by ID
}
