// src/modules/product/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './common/dto';
import { getProductDto } from './common/dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    limit = 10,
    page = 1,
    type,
    billingCycle,
    search,
    status,
  }: getProductDto) {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(type && { type }),
      ...(status && { status }),
      ...(billingCycle && { billingCycle }),
      ...(search && {
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
      }),
    };

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    return {
      products,
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

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        quantity: true,
        billingCycle: true,
        price: true,
        discount: true,
        tax: true,
        vat: true,
        isActive: true,
        isDeleted: true,
        status: true,
        orders: {
          select: {
            id: true,
            amount: true,
            domainName: true,
            updatedAt: true,
            paidAt: true,
            expiresAt: true,
            status: true,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(data: CreateProductDto) {
    const product = await this.prisma.product.create({ data });
    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data,
    });
    return {
      message: 'Product updated successfully',
      data: product,
    };
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.delete({ where: { id } });
    return {
      message: 'Product deleted successfully',
      data: product,
    };
  }
}
