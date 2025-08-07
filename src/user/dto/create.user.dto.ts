import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'CUSTOMER', 'MODERATOR']),
});


export type CreateUserDto = z.infer<typeof CreateUserSchema>;