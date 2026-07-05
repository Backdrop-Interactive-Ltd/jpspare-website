CREATE TYPE "ReferralStatus" AS ENUM (
    'PENDING',
    'QUALIFIED',
    'REWARDED',
    'CANCELLED',
    'REJECTED'
);

CREATE TYPE "ReferralRewardType" AS ENUM (
    'LOYALTY_POINTS',
    'COUPON',
    'MANUAL'
);

CREATE TYPE "ReferralRewardStatus" AS ENUM (
    'PENDING',
    'ISSUED',
    'CANCELLED',
    'FAILED'
);

CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReferralRelationship" (
    "id" TEXT NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "referrerCustomerId" TEXT NOT NULL,
    "referredCustomerId" TEXT,
    "referredEmail" TEXT,
    "referredPhone" TEXT,
    "qualifyingOrderId" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "qualifiedAt" TIMESTAMP(3),
    "rewardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralRelationship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "ReferralRewardType" NOT NULL,
    "status" "ReferralRewardStatus" NOT NULL DEFAULT 'PENDING',
    "points" INTEGER,
    "couponId" TEXT,
    "value" TEXT,
    "description" TEXT,
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");
CREATE INDEX "ReferralCode_customerId_idx" ON "ReferralCode"("customerId");
CREATE INDEX "ReferralCode_isActive_idx" ON "ReferralCode"("isActive");

CREATE INDEX "ReferralRelationship_referralCodeId_idx" ON "ReferralRelationship"("referralCodeId");
CREATE INDEX "ReferralRelationship_referrerCustomerId_idx" ON "ReferralRelationship"("referrerCustomerId");
CREATE INDEX "ReferralRelationship_referredCustomerId_idx" ON "ReferralRelationship"("referredCustomerId");
CREATE INDEX "ReferralRelationship_qualifyingOrderId_idx" ON "ReferralRelationship"("qualifyingOrderId");
CREATE INDEX "ReferralRelationship_status_idx" ON "ReferralRelationship"("status");

CREATE INDEX "ReferralReward_relationshipId_idx" ON "ReferralReward"("relationshipId");
CREATE INDEX "ReferralReward_customerId_idx" ON "ReferralReward"("customerId");
CREATE INDEX "ReferralReward_orderId_idx" ON "ReferralReward"("orderId");
CREATE INDEX "ReferralReward_couponId_idx" ON "ReferralReward"("couponId");
CREATE INDEX "ReferralReward_status_idx" ON "ReferralReward"("status");

ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferralRelationship" ADD CONSTRAINT "ReferralRelationship_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferralRelationship" ADD CONSTRAINT "ReferralRelationship_referrerCustomerId_fkey" FOREIGN KEY ("referrerCustomerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferralRelationship" ADD CONSTRAINT "ReferralRelationship_referredCustomerId_fkey" FOREIGN KEY ("referredCustomerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReferralRelationship" ADD CONSTRAINT "ReferralRelationship_qualifyingOrderId_fkey" FOREIGN KEY ("qualifyingOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "ReferralRelationship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
