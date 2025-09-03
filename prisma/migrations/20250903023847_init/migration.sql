-- AlterEnum
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "public"."Payment" ALTER COLUMN "paidAt" DROP NOT NULL,
ALTER COLUMN "paidAt" DROP DEFAULT;
