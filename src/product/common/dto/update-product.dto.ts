import { z } from 'zod';

export const UpdateProductSchema = z.object({
  name: z.string().optional(),
  type: z
    .enum([
      'DOMAIN',
      'HOSTING',
      'SSL',
      'EMAIL',
      'VPS',
      'CLOUD',
      'DEDICATED',
      'SMS',
    ])
    .optional(),
  billingCycle: z.enum(['MONTHLY', 'ANNUALLY', 'LIFETIME']).optional(),
  quantity: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  grade: z.enum(['FREE', 'BASIC', 'PREMIUM']).default('FREE').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  config: z.any().optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
