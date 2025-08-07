import { z } from 'zod';

export const updateCupponSchema = z.object({
  code: z.string().min(3).optional(),
  discount: z.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
  expiesAt: z.coerce.date().optional(),
});

export type updateCupponDto = z.infer<typeof updateCupponSchema>;
