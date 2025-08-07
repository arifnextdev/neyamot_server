import { z } from 'zod';

export const orderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'FAILED',
    'PAID',
    'CANCELLED',
    'REFUNDED',
    'EXPIRED',
  ]),
});
export type OrderStatus = z.infer<typeof orderStatusSchema>;
