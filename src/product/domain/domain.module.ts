import { Module } from '@nestjs/common';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule {}
