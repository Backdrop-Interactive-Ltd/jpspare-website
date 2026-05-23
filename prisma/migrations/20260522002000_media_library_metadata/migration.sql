-- Add centralized media metadata for the JPSPARE CMS media library.
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "fileName" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "originalName" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "filePath" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "width" INTEGER;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "height" INTEGER;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "uploadedById" TEXT;

UPDATE "Media"
SET "fileName" = COALESCE("fileName", "filename"),
    "fileSize" = COALESCE("fileSize", "size"),
    "filePath" = COALESCE("filePath", "url")
WHERE "fileName" IS NULL OR "fileSize" IS NULL OR "filePath" IS NULL;

DO $$ BEGIN
  ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "Media_uploadedById_idx" ON "Media"("uploadedById");
CREATE INDEX IF NOT EXISTS "Media_mimeType_idx" ON "Media"("mimeType");
