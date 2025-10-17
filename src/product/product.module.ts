import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DomainModule } from './domain/domain.module';

@Module({
  imports: [PrismaModule, DomainModule],
  providers: [ProductService],
})
export class ProductModule {}
