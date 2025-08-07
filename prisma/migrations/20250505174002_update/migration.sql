/*
  Warnings:

  - Made the column `vat` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "vat" SET NOT NULL,
ALTER COLUMN "discount" DROP NOT NULL;
