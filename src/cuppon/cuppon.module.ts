import { Module } from '@nestjs/common';
import { CupponService } from './cuppon.service';
import { CupponController } from './cuppon.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CupponService],
  controllers: [CupponController],
  exports: [CupponService],
})
export class CupponModule {}
