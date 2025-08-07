// import { z } from 'zod';
// import { ProductType, ProductStatus } from '@prisma/client';

// export const createProductDto = z.object({
//   name: z.string().min(3),
//   type: z.nativeEnum(ProductType),
//   description: z.string().optional(),
//   price: z.number().min(0),
//   config: z.any().optional(),
//   status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.ACTIVE),
// });

// export default createProductDto;

export type getProductDto = {
  limit: number;
  page: number;
  type?: string;
  billingCycle?: string;
  search?: string;
  status?: string;
};
