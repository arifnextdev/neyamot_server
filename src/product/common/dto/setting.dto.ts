import { z } from 'zod';

export const CreateSettingSchema = z.object({
  key: z.string().min(2),
  value: z.any(),
});

export type CreateSettingDto = z.infer<typeof CreateSettingSchema>;
