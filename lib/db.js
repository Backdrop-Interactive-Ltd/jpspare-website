import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";

const globalForPrisma = globalThis;
const PRISMA_GLOBAL_KEY = "__jpspare_prisma_client_v3_2_api_keys";
const require = createRequire(import.meta.url);
const { createPrismaOptions } = require("./prismaOptions.cjs");

const requiredDelegates = [
  "product",
  "category",
  "brand",
  "media",
  "apiKey",
  "customer",
  "cart",
  "cartItem",
  "wishlistItem",
  "order",
  "orderItem",
  "payment",
  "coupon",
  "supplier",
  "purchaseOrder",
  "purchaseOrderItem",
  "purchaseTimelineEvent",
  "inventoryMovement",
];

function hasCurrentPrismaDelegates(client) {
  return Boolean(client) && requiredDelegates.every((delegate) => client[delegate]);
}

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma[PRISMA_GLOBAL_KEY] &&
  !hasCurrentPrismaDelegates(globalForPrisma[PRISMA_GLOBAL_KEY])
) {
  globalForPrisma[PRISMA_GLOBAL_KEY].$disconnect?.().catch(() => null);
  globalForPrisma[PRISMA_GLOBAL_KEY] = undefined;
}

export const prisma =
  globalForPrisma[PRISMA_GLOBAL_KEY] ||
  new PrismaClient(createPrismaOptions());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma[PRISMA_GLOBAL_KEY] = prisma;
}
