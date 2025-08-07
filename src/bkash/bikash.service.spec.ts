import { Test, TestingModule } from '@nestjs/testing';
import { BikashService } from './bikash.service';

describe('BikashService', () => {
  let service: BikashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BikashService],
    }).compile();

    service = module.get<BikashService>(BikashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
