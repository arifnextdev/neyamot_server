import { z } from 'zod';

export const CreateCupponSchema = z.object({
  code: z.string().min(3),
  discount: z.number().min(0).max(100),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']),
  expiesAt: z.coerce.date(),
});

export type createCupponDto = z.infer<typeof CreateCupponSchema>;

//update cuppon all partial
