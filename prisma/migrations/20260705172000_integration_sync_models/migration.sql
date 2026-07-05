CREATE TYPE "IntegrationEventStatus" AS ENUM (
    'RECEIVED',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'SKIPPED'
);

CREATE TYPE "IntegrationConflictStatus" AS ENUM (
    'OPEN',
    'RESOLVED',
    'IGNORED'
);

CREATE TABLE "IntegrationEventLog" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "targetSystem" TEXT,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "externalId" TEXT,
    "apiKeyId" TEXT,
    "requestId" TEXT,
    "idempotencyKey" TEXT,
    "status" "IntegrationEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "payloadJson" JSONB,
    "responseJson" JSONB,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationEventLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationIdempotencyKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestHash" TEXT,
    "responseJson" JSONB,
    "status" "IntegrationEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationIdempotencyKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationConflict" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "externalId" TEXT,
    "conflictType" TEXT NOT NULL,
    "fieldPath" TEXT,
    "localValueJson" JSONB,
    "incomingValueJson" JSONB,
    "status" "IntegrationConflictStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionJson" JSONB,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConflict_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntegrationEventLog_direction_idx" ON "IntegrationEventLog"("direction");
CREATE INDEX "IntegrationEventLog_sourceSystem_idx" ON "IntegrationEventLog"("sourceSystem");
CREATE INDEX "IntegrationEventLog_eventType_idx" ON "IntegrationEventLog"("eventType");
CREATE INDEX "IntegrationEventLog_entityType_idx" ON "IntegrationEventLog"("entityType");
CREATE INDEX "IntegrationEventLog_entityId_idx" ON "IntegrationEventLog"("entityId");
CREATE INDEX "IntegrationEventLog_externalId_idx" ON "IntegrationEventLog"("externalId");
CREATE INDEX "IntegrationEventLog_status_idx" ON "IntegrationEventLog"("status");
CREATE INDEX "IntegrationEventLog_idempotencyKey_idx" ON "IntegrationEventLog"("idempotencyKey");
CREATE INDEX "IntegrationEventLog_createdAt_idx" ON "IntegrationEventLog"("createdAt");

CREATE UNIQUE INDEX "IntegrationIdempotencyKey_key_key" ON "IntegrationIdempotencyKey"("key");
CREATE INDEX "IntegrationIdempotencyKey_sourceSystem_idx" ON "IntegrationIdempotencyKey"("sourceSystem");
CREATE INDEX "IntegrationIdempotencyKey_endpoint_idx" ON "IntegrationIdempotencyKey"("endpoint");
CREATE INDEX "IntegrationIdempotencyKey_status_idx" ON "IntegrationIdempotencyKey"("status");
CREATE INDEX "IntegrationIdempotencyKey_expiresAt_idx" ON "IntegrationIdempotencyKey"("expiresAt");

CREATE INDEX "IntegrationConflict_entityType_idx" ON "IntegrationConflict"("entityType");
CREATE INDEX "IntegrationConflict_entityId_idx" ON "IntegrationConflict"("entityId");
CREATE INDEX "IntegrationConflict_externalId_idx" ON "IntegrationConflict"("externalId");
CREATE INDEX "IntegrationConflict_conflictType_idx" ON "IntegrationConflict"("conflictType");
CREATE INDEX "IntegrationConflict_status_idx" ON "IntegrationConflict"("status");
CREATE INDEX "IntegrationConflict_createdAt_idx" ON "IntegrationConflict"("createdAt");
