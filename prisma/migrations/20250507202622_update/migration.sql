/*
  Warnings:

  - The values [GITHUB] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('GOOGLE', 'FACEBOOK', 'CREDENTIAL');
ALTER TABLE "User" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "provider" TYPE "AuthProvider_new" USING ("provider"::text::"AuthProvider_new");
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "AuthProvider_old";
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'CREDENTIAL';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetToken",
ADD COLUMN     "refreshToken" TEXT;
