import { Test, TestingModule } from '@nestjs/testing';
import { OrderReminderService } from './order-reminder.service';

describe('OrderReminderService', () => {
  let service: OrderReminderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderReminderService],
    }).compile();

    service = module.get<OrderReminderService>(OrderReminderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
