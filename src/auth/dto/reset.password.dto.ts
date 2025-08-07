import { z } from 'zod';

export const ResetPasswordSchema = z
  .object({
    email: z.string().email(),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
