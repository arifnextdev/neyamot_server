import { z } from 'zod';

export const userUpdateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  roles: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED']).optional(),
});
