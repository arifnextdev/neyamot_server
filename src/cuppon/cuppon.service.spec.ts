import { Test, TestingModule } from '@nestjs/testing';
import { CupponService } from './cuppon.service';

describe('CupponService', () => {
  let service: CupponService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CupponService],
    }).compile();

    service = module.get<CupponService>(CupponService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
