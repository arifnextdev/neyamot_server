import { Test, TestingModule } from '@nestjs/testing';
import { BikashController } from './bikash.controller';

describe('BikashController', () => {
  let controller: BikashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BikashController],
    }).compile();

    controller = module.get<BikashController>(BikashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
