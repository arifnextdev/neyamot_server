import { Test, TestingModule } from '@nestjs/testing';
import { CupponController } from './cuppon.controller';

describe('CupponController', () => {
  let controller: CupponController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CupponController],
    }).compile();

    controller = module.get<CupponController>(CupponController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
