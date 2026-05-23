CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REVOKED');

CREATE TABLE "ApiKey" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL DEFAULT 'BMS Integration',
  "keyPrefix" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
  "allowedIps" TEXT,
  "webhookUrl" TEXT,
  "lastUsedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdById" TEXT,
  "source" TEXT NOT NULL DEFAULT 'LOCAL',
  "syncStatus" "SyncStatus" NOT NULL DEFAULT 'LOCAL',
  "lastSyncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
CREATE INDEX "ApiKey_status_idx" ON "ApiKey"("status");
CREATE INDEX "ApiKey_keyPrefix_idx" ON "ApiKey"("keyPrefix");
CREATE INDEX "ApiKey_createdById_idx" ON "ApiKey"("createdById");
CREATE INDEX "ApiKey_source_syncStatus_idx" ON "ApiKey"("source", "syncStatus");

ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
