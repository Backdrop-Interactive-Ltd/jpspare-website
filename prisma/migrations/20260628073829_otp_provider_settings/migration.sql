-- CreateEnum
CREATE TYPE "OtpProviderType" AS ENUM ('GENERIC_HTTP', 'SMTP', 'CUSTOM_API');

-- CreateEnum
CREATE TYPE "OtpTemplatePurpose" AS ENUM ('OTP_LOGIN');

-- CreateTable
CREATE TABLE "OtpProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "providerType" "OtpProviderType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "baseUrl" TEXT,
    "method" TEXT,
    "fromEmail" TEXT,
    "fromName" TEXT,
    "senderId" TEXT,
    "configJson" JSONB,
    "secretJsonEncrypted" TEXT,
    "timeoutMs" INTEGER NOT NULL DEFAULT 10000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpTemplate" (
    "id" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "purpose" "OtpTemplatePurpose" NOT NULL DEFAULT 'OTP_LOGIN',
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpProvider_channel_idx" ON "OtpProvider"("channel");

-- CreateIndex
CREATE INDEX "OtpProvider_channel_isActive_idx" ON "OtpProvider"("channel", "isActive");

-- CreateIndex
CREATE INDEX "OtpProvider_channel_isDefault_idx" ON "OtpProvider"("channel", "isDefault");

-- CreateIndex
CREATE INDEX "OtpProvider_providerType_idx" ON "OtpProvider"("providerType");

-- CreateIndex
CREATE INDEX "OtpTemplate_channel_idx" ON "OtpTemplate"("channel");

-- CreateIndex
CREATE INDEX "OtpTemplate_channel_purpose_idx" ON "OtpTemplate"("channel", "purpose");

-- CreateIndex
CREATE INDEX "OtpTemplate_isActive_idx" ON "OtpTemplate"("isActive");
