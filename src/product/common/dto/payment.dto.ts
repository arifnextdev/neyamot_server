import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export const CreatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z
    .nativeEnum(PaymentMethod)
    .optional()
    .default(PaymentMethod.SSLCOMMERZ),
  status: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.PENDING),
  transId: z.string().optional(),
  amount: z.number().min(0),
  paidAt: z.coerce.date().optional().default(new Date()),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
