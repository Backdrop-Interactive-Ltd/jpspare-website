-- AlterTable
ALTER TABLE "InventoryMovement"
ADD COLUMN "warehouseRefId" TEXT,
ADD COLUMN "locationId" TEXT,
ADD COLUMN "binId" TEXT,
ADD COLUMN "warehouseStockId" TEXT,
ADD COLUMN "stockTransferId" TEXT,
ADD COLUMN "stockTransferItemId" TEXT;

-- CreateIndex
CREATE INDEX "InventoryMovement_warehouseRefId_idx" ON "InventoryMovement"("warehouseRefId");

-- CreateIndex
CREATE INDEX "InventoryMovement_locationId_idx" ON "InventoryMovement"("locationId");

-- CreateIndex
CREATE INDEX "InventoryMovement_binId_idx" ON "InventoryMovement"("binId");

-- CreateIndex
CREATE INDEX "InventoryMovement_warehouseStockId_idx" ON "InventoryMovement"("warehouseStockId");

-- CreateIndex
CREATE INDEX "InventoryMovement_stockTransferId_idx" ON "InventoryMovement"("stockTransferId");

-- CreateIndex
CREATE INDEX "InventoryMovement_stockTransferItemId_idx" ON "InventoryMovement"("stockTransferItemId");

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_warehouseRefId_fkey" FOREIGN KEY ("warehouseRefId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_binId_fkey" FOREIGN KEY ("binId") REFERENCES "StockBin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_warehouseStockId_fkey" FOREIGN KEY ("warehouseStockId") REFERENCES "WarehouseStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_stockTransferId_fkey" FOREIGN KEY ("stockTransferId") REFERENCES "StockTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_stockTransferItemId_fkey" FOREIGN KEY ("stockTransferItemId") REFERENCES "StockTransferItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
