import { z } from 'zod';

export const adminOrderCreateSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  paymentMethod: z.enum(['CASH', 'BIKASH']).default('BIKASH'),
  paymentStatus: z.enum(['PENDING', 'SUCCESS', 'DUE']).default('PENDING'),
  domainName: z.string(),
  password: z.string().min(6),
  userName: z.string().min(3),
});

export type AdminOrderCreateDto = z.infer<typeof adminOrderCreateSchema>;

// export const AdminOrderCreateDto = z
//   .object({
//     userId: z.string().min(1, 'User ID is required'),
//     productId: z.string().min(1, 'Product ID is required'),
//     userName: z.string().min(1, 'User Name is required'),

//     domainName: z.string().optional(),

//     paymentMethod: z.enum(['BKASH', 'NAGAD', 'SSL', 'CASH', 'CARD'], {
//       required_error: 'Payment method is required',
//     }),
//     paymentStatus: z.enum(['', ], {
//       required_error: 'Payment status is required',
//     }),

//     productType: z.enum(['DOMAIN', 'VPS', 'EMAIL', 'SMS', 'SSL', 'STORAGE']),

//     registrationPeriod: z.number().int().positive().optional(), // for domain/hosting
//     os: z.string().optional(), // for VPS
//     emailUser: z.string().optional(), // for EMAIL

//     senderId: z.string().optional(),
//     smsApiKey: z.string().optional(),
//     smsGatewayUrl: z.string().url('Invalid URL').optional(),

//     ip: z.string().optional(),
//     location: z.string().optional(),

//     certificateType: z.string().optional(),
//     csr: z.string().optional(),

//     provider: z.string().optional(),
//     apiKey: z.string().optional(),
//     bucket: z.string().optional(),
//     region: z.string().optional(),
//   })
//   .superRefine((data, ctx) => {
//     if (data.productType === 'DOMAIN' && !data.registrationPeriod) {
//       ctx.addIssue({
//         path: ['registrationPeriod'],
//         message: 'Registration period is required for DOMAIN product',
//         code: z.ZodIssueCode.custom,
//       });
//     }

//     if (data.productType === 'VPS' && !data.os) {
//       ctx.addIssue({
//         path: ['os'],
//         message: 'OS is required for VPS product',
//         code: z.ZodIssueCode.custom,
//       });
//     }

//     if (data.productType === 'EMAIL' && !data.emailUser) {
//       ctx.addIssue({
//         path: ['emailUser'],
//         message: 'Email user is required for EMAIL product',
//         code: z.ZodIssueCode.custom,
//       });
//     }

//     if (data.productType === 'SMS') {
//       if (!data.senderId) {
//         ctx.addIssue({
//           path: ['senderId'],
//           message: 'Sender ID is required for SMS product',
//           code: z.ZodIssueCode.custom,
//         });
//       }
//       if (!data.smsApiKey) {
//         ctx.addIssue({
//           path: ['smsApiKey'],
//           message: 'API key is required for SMS product',
//           code: z.ZodIssueCode.custom,
//         });
//       }
//       if (!data.smsGatewayUrl) {
//         ctx.addIssue({
//           path: ['smsGatewayUrl'],
//           message: 'Gateway URL is required for SMS product',
//           code: z.ZodIssueCode.custom,
//         });
//       }
//     }

//     if (data.productType === 'SSL') {
//       if (!data.certificateType) {
//         ctx.addIssue({
//           path: ['certificateType'],
//           message: 'Certificate type is required for SSL product',
//           code: z.ZodIssueCode.custom,
//         });
//       }
//       if (!data.csr) {
//         ctx.addIssue({
//           path: ['csr'],
//           message: 'CSR is required for SSL product',
//           code: z.ZodIssueCode.custom,
//         });
//       }
//     }

//     if (data.productType === 'STORAGE') {
//       ['provider', 'apiKey', 'bucket', 'region'].forEach((field) => {
//         if (!data[field as keyof typeof data]) {
//           ctx.addIssue({
//             path: [field],
//             message: `${field} is required for STORAGE product`,
//             code: z.ZodIssueCode.custom,
//           });
//         }
//       });
//     }
//   });

// // Export inferred type
// export type AdminOrderCreateDto = z.infer<typeof AdminOrderCreateDto>;
