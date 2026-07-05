-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'INSPECTING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('RESTOCK', 'REPAIR', 'WRITE_OFF', 'RETURN_TO_CUSTOMER');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED');

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT,
    "notes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnItem" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnInspection" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "result" "InspectionResult" NOT NULL,
    "notes" TEXT,
    "inspectedById" TEXT,
    "inspectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundCase" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "refundAmount" DECIMAL(12,2) NOT NULL,
    "refundMethod" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_returnNumber_key" ON "ReturnRequest"("returnNumber");

-- CreateIndex
CREATE INDEX "ReturnRequest_orderId_idx" ON "ReturnRequest"("orderId");

-- CreateIndex
CREATE INDEX "ReturnRequest_customerId_idx" ON "ReturnRequest"("customerId");

-- CreateIndex
CREATE INDEX "ReturnRequest_status_idx" ON "ReturnRequest"("status");

-- CreateIndex
CREATE INDEX "ReturnItem_returnRequestId_idx" ON "ReturnItem"("returnRequestId");

-- CreateIndex
CREATE INDEX "ReturnItem_productId_idx" ON "ReturnItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnInspection_returnRequestId_key" ON "ReturnInspection"("returnRequestId");

-- CreateIndex
CREATE INDEX "ReturnInspection_inspectedById_idx" ON "ReturnInspection"("inspectedById");

-- CreateIndex
CREATE UNIQUE INDEX "RefundCase_returnRequestId_key" ON "RefundCase"("returnRequestId");

-- CreateIndex
CREATE INDEX "RefundCase_refundStatus_idx" ON "RefundCase"("refundStatus");

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnInspection" ADD CONSTRAINT "ReturnInspection_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnInspection" ADD CONSTRAINT "ReturnInspection_inspectedById_fkey" FOREIGN KEY ("inspectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundCase" ADD CONSTRAINT "RefundCase_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
