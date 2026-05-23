ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'STRIPE';

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentGateway" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "transactionId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "gatewayResponse" JSONB;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMeta" JSONB;

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "gateway" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "gatewayResponse" JSONB;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentMeta" JSONB;

CREATE INDEX IF NOT EXISTS "Order_paymentGateway_idx" ON "Order"("paymentGateway");
CREATE INDEX IF NOT EXISTS "Order_transactionId_idx" ON "Order"("transactionId");
CREATE INDEX IF NOT EXISTS "Payment_gateway_idx" ON "Payment"("gateway");
CREATE INDEX IF NOT EXISTS "Payment_transactionId_idx" ON "Payment"("transactionId");
