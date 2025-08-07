-- DropIndex
DROP INDEX "User_email_status_username_createdAt_phone_idx";

-- CreateIndex
CREATE INDEX "User_email_status_username_createdAt_phone_refreshToken_idx" ON "User"("email", "status", "username", "createdAt", "phone", "refreshToken");
