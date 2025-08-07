import { Controller, Get, Query } from '@nestjs/common';
import { DomainService } from './domain.service';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('check')
  checkDomain(@Query('name') name: string) {
    return this.domainService.checkDomain(name);
  }
}
