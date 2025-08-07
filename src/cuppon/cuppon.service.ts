import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createCupponDto } from './dto/create.cuppon.dto';
import { updateCupponDto } from './dto/update.cuppon.dto';

@Injectable()
export class CupponService {
  constructor(private readonly prisma: PrismaService) {}

  async getCuppons({
    page = 1,
    limit = 5,
    status,
    search,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(search && {
        OR: [{ code: { contains: search, mode: 'insensitive' } }],
      }),
    };
    const [cuppons, totalCount] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      cuppons,
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

  async createCuppon(data: createCupponDto) {
    if (data.expiesAt < new Date())
      return { message: 'Expired Date is less than current date' };

    const cuppon = await this.prisma.coupon.findUnique({
      where: { code: data.code },
    });
    if (cuppon) throw new ConflictException('Cuppon already exists');

    return await this.prisma.coupon.create({ data });
  }

  async updateCuppon(id: string, data: updateCupponDto) {
    console.log(data);
    if (data.expiesAt && data.expiesAt < new Date())
      return { message: 'Expired Date is less than current date' };

    const cuppon = await this.prisma.coupon.update({
      where: { id },
      data,
    });

    if (!cuppon) throw new NotFoundException('Cuppon not found');
    return {
      message: 'Cuppon updated successfully',
    };
  }

  async deleteCuppon(id: string) {
    const cuppon = await this.prisma.coupon.delete({ where: { id } });
    if (!cuppon) throw new NotFoundException('Cuppon not found');
    return {
      message: 'Cuppon deleted successfully',
    };
  }
}
