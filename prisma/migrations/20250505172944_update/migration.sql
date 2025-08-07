-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER', 'USER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'PENDING', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'GITHUB', 'CREDENTIAL');

-- CreateEnum
CREATE TYPE "LoginHistoryStatus" AS ENUM ('SUCCESS', 'FAILED', 'LOCKED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED', 'PENDING');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUALLY', 'LIFETIME', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "ProductGrading" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('DOMAIN', 'HOSTING', 'SSL', 'EMAIL', 'VPS', 'CLOUD', 'DEDICATED', 'SMS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'DUE', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('SSLCOMMERZ', 'BIKASH', 'NAGAD', 'BANK', 'CASH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CouponStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "roles" "Role"[] DEFAULT ARRAY['CUSTOMER']::"Role"[],
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "provider" "AuthProvider" NOT NULL DEFAULT 'CREDENTIAL',
    "providerId" TEXT,
    "resetToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attempt" "LoginHistoryStatus" NOT NULL DEFAULT 'SUCCESS',
    "ip" TEXT,
    "country" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "quantity" INTEGER DEFAULT 1,
    "grade" "ProductGrading" NOT NULL DEFAULT 'FREE',
    "description" TEXT,
    "vat" DOUBLE PRECISION DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "config" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "domainName" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" DEFAULT 'CUSTOM',
    "status" "PaymentStatus" DEFAULT 'DUE',
    "currency" TEXT DEFAULT 'BDT',
    "transId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION DEFAULT 0,
    "vat" DOUBLE PRECISION DEFAULT 0,
    "discount" DOUBLE PRECISION DEFAULT 0,
    "subtotal" DOUBLE PRECISION DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "status" "CouponStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_status_username_createdAt_phone_idx" ON "User"("email", "status", "username", "createdAt", "phone");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_createdAt_idx" ON "LoginHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_productId_createdAt_idx" ON "Order"("userId", "productId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_userId_status_transId_orderId_paidAt_idx" ON "Payment"("userId", "status", "transId", "orderId", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
