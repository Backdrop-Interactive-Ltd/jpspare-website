-- Add ERP/BMS-ready invoice metadata to orders.
ALTER TABLE "Order" ADD COLUMN "invoiceNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "invoiceGeneratedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "printedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_invoiceNumber_key" ON "Order"("invoiceNumber");
CREATE INDEX "Order_invoiceNumber_idx" ON "Order"("invoiceNumber");
