CREATE TABLE "CustomerSegment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "rulesJson" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastEvaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSegment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerSegment_slug_key" ON "CustomerSegment"("slug");
CREATE INDEX "CustomerSegment_isActive_idx" ON "CustomerSegment"("isActive");
CREATE INDEX "CustomerSegment_lastEvaluatedAt_idx" ON "CustomerSegment"("lastEvaluatedAt");
CREATE INDEX "CustomerSegment_createdAt_idx" ON "CustomerSegment"("createdAt");
