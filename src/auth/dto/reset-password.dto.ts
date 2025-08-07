import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  password: z.string().min(6),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
