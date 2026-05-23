-- AlterTable
ALTER TABLE "Category" ADD COLUMN "thumbnailUrl" TEXT;
ALTER TABLE "Category" ADD COLUMN "iconUrl" TEXT;
ALTER TABLE "Category" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN "showInMenu" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Category" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Category" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Category" ADD COLUMN "seoKeywords" TEXT;

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN "coverImageUrl" TEXT;
ALTER TABLE "Brand" ADD COLUMN "websiteUrl" TEXT;
ALTER TABLE "Brand" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Brand" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Brand" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Brand" ADD COLUMN "seoKeywords" TEXT;

-- CreateTable
CREATE TABLE "CategoryImage" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "mediaId" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'THUMBNAIL',
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "externalId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'LOCAL',
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'LOCAL',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_isFeatured_idx" ON "Category"("isFeatured");

-- CreateIndex
CREATE INDEX "Category_showInMenu_idx" ON "Category"("showInMenu");

-- CreateIndex
CREATE INDEX "Brand_isFeatured_idx" ON "Brand"("isFeatured");

-- CreateIndex
CREATE INDEX "CategoryImage_categoryId_idx" ON "CategoryImage"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryImage_mediaId_idx" ON "CategoryImage"("mediaId");

-- CreateIndex
CREATE INDEX "CategoryImage_externalId_idx" ON "CategoryImage"("externalId");

-- CreateIndex
CREATE INDEX "CategoryImage_source_syncStatus_idx" ON "CategoryImage"("source", "syncStatus");

-- AddForeignKey
ALTER TABLE "CategoryImage" ADD CONSTRAINT "CategoryImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryImage" ADD CONSTRAINT "CategoryImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
