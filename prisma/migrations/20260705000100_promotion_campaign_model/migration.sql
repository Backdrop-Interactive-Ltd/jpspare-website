-- CreateEnum
CREATE TYPE "PromotionCampaignType" AS ENUM ('FLASH_SALE', 'EID_CAMPAIGN', 'BRAND_CAMPAIGN', 'CATEGORY_CAMPAIGN', 'FREE_SHIPPING', 'BUNDLE_OFFER', 'NEW_ARRIVAL', 'CLEARANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PromotionCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "PromotionCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PromotionCampaignType" NOT NULL DEFAULT 'CUSTOM',
    "status" "PromotionCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "rulesJson" JSONB,
    "actionsJson" JSONB,
    "bannerImage" TEXT,
    "landingPageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotionCampaign_slug_key" ON "PromotionCampaign"("slug");

-- CreateIndex
CREATE INDEX "PromotionCampaign_status_idx" ON "PromotionCampaign"("status");

-- CreateIndex
CREATE INDEX "PromotionCampaign_type_idx" ON "PromotionCampaign"("type");

-- CreateIndex
CREATE INDEX "PromotionCampaign_startsAt_idx" ON "PromotionCampaign"("startsAt");

-- CreateIndex
CREATE INDEX "PromotionCampaign_endsAt_idx" ON "PromotionCampaign"("endsAt");

-- CreateIndex
CREATE INDEX "PromotionCampaign_priority_idx" ON "PromotionCampaign"("priority");
