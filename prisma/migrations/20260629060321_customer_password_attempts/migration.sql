-- CreateTable
CREATE TABLE "CustomerPasswordAttempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPasswordAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerPasswordAttempt_lockedUntil_idx" ON "CustomerPasswordAttempt"("lockedUntil");

-- CreateIndex
CREATE INDEX "CustomerPasswordAttempt_lastAttemptAt_idx" ON "CustomerPasswordAttempt"("lastAttemptAt");

-- CreateIndex
CREATE INDEX "CustomerPasswordAttempt_channel_idx" ON "CustomerPasswordAttempt"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPasswordAttempt_identifier_channel_key" ON "CustomerPasswordAttempt"("identifier", "channel");
