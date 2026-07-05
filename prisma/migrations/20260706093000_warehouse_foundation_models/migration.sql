CREATE TYPE "WarehouseStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);

CREATE TYPE "StockTransferStatus" AS ENUM (
    'DRAFT',
    'REQUESTED',
    'IN_TRANSIT',
    'PARTIALLY_RECEIVED',
    'RECEIVED',
    'CANCELLED'
);

CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "externalId" TEXT,
    "source" TEXT,
    "syncStatus" "SyncStatus",
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WarehouseLocation" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "zone" TEXT,
    "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarehouseLocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockBin" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "locationId" TEXT,
    "code" TEXT NOT NULL,
    "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',
    "capacityJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockBin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WarehouseStock" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "locationId" TEXT,
    "binId" TEXT,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarehouseStock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockTransfer" (
    "id" TEXT NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "status" "StockTransferStatus" NOT NULL DEFAULT 'DRAFT',
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "fromBinId" TEXT,
    "toBinId" TEXT,
    "requestedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransfer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockTransferItem" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "receivedQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransferItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");
CREATE INDEX "Warehouse_status_idx" ON "Warehouse"("status");
CREATE INDEX "Warehouse_externalId_idx" ON "Warehouse"("externalId");

CREATE INDEX "WarehouseLocation_warehouseId_idx" ON "WarehouseLocation"("warehouseId");
CREATE INDEX "WarehouseLocation_code_idx" ON "WarehouseLocation"("code");
CREATE INDEX "WarehouseLocation_status_idx" ON "WarehouseLocation"("status");

CREATE INDEX "StockBin_warehouseId_idx" ON "StockBin"("warehouseId");
CREATE INDEX "StockBin_locationId_idx" ON "StockBin"("locationId");
CREATE INDEX "StockBin_code_idx" ON "StockBin"("code");
CREATE INDEX "StockBin_status_idx" ON "StockBin"("status");

CREATE INDEX "WarehouseStock_productId_idx" ON "WarehouseStock"("productId");
CREATE INDEX "WarehouseStock_warehouseId_idx" ON "WarehouseStock"("warehouseId");
CREATE INDEX "WarehouseStock_locationId_idx" ON "WarehouseStock"("locationId");
CREATE INDEX "WarehouseStock_binId_idx" ON "WarehouseStock"("binId");

CREATE UNIQUE INDEX "StockTransfer_transferNumber_key" ON "StockTransfer"("transferNumber");
CREATE INDEX "StockTransfer_status_idx" ON "StockTransfer"("status");
CREATE INDEX "StockTransfer_fromWarehouseId_idx" ON "StockTransfer"("fromWarehouseId");
CREATE INDEX "StockTransfer_toWarehouseId_idx" ON "StockTransfer"("toWarehouseId");

CREATE INDEX "StockTransferItem_transferId_idx" ON "StockTransferItem"("transferId");
CREATE INDEX "StockTransferItem_productId_idx" ON "StockTransferItem"("productId");

ALTER TABLE "WarehouseLocation" ADD CONSTRAINT "WarehouseLocation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StockBin" ADD CONSTRAINT "StockBin_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockBin" ADD CONSTRAINT "StockBin_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_binId_fkey" FOREIGN KEY ("binId") REFERENCES "StockBin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_fromBinId_fkey" FOREIGN KEY ("fromBinId") REFERENCES "StockBin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_toBinId_fkey" FOREIGN KEY ("toBinId") REFERENCES "StockBin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StockTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
