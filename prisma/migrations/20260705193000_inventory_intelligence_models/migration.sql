CREATE TABLE "InventoryAnalytics" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "availableStock" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER,
    "stockStatus" TEXT,
    "salesLast7Days" INTEGER NOT NULL DEFAULT 0,
    "salesLast30Days" INTEGER NOT NULL DEFAULT 0,
    "salesLast90Days" INTEGER NOT NULL DEFAULT 0,
    "velocityScore" DOUBLE PRECISION,
    "abcClass" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAnalytics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReorderSuggestion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "suggestedQuantity" INTEGER NOT NULL,
    "reason" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "estimatedDemand" INTEGER,
    "currentStock" INTEGER,
    "leadTimeDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReorderSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DemandForecast" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "forecastQuantity" INTEGER NOT NULL,
    "actualQuantity" INTEGER,
    "confidenceScore" DOUBLE PRECISION,
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandForecast_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeadStockSnapshot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "daysWithoutSale" INTEGER,
    "lastSoldAt" TIMESTAMP(3),
    "estimatedValue" DECIMAL(12,2),
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadStockSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InventoryAnalytics_productId_idx" ON "InventoryAnalytics"("productId");
CREATE INDEX "InventoryAnalytics_calculatedAt_idx" ON "InventoryAnalytics"("calculatedAt");
CREATE INDEX "InventoryAnalytics_abcClass_idx" ON "InventoryAnalytics"("abcClass");

CREATE INDEX "ReorderSuggestion_productId_idx" ON "ReorderSuggestion"("productId");
CREATE INDEX "ReorderSuggestion_status_idx" ON "ReorderSuggestion"("status");
CREATE INDEX "ReorderSuggestion_priority_idx" ON "ReorderSuggestion"("priority");

CREATE INDEX "DemandForecast_productId_idx" ON "DemandForecast"("productId");
CREATE INDEX "DemandForecast_periodStart_idx" ON "DemandForecast"("periodStart");
CREATE INDEX "DemandForecast_periodEnd_idx" ON "DemandForecast"("periodEnd");

CREATE INDEX "DeadStockSnapshot_productId_idx" ON "DeadStockSnapshot"("productId");
CREATE INDEX "DeadStockSnapshot_calculatedAt_idx" ON "DeadStockSnapshot"("calculatedAt");
CREATE INDEX "DeadStockSnapshot_status_idx" ON "DeadStockSnapshot"("status");

ALTER TABLE "InventoryAnalytics" ADD CONSTRAINT "InventoryAnalytics_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReorderSuggestion" ADD CONSTRAINT "ReorderSuggestion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DemandForecast" ADD CONSTRAINT "DemandForecast_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeadStockSnapshot" ADD CONSTRAINT "DeadStockSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
