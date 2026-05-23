import { prisma } from "../db";
import { parseMoney, serializeCart } from "./cart";

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
export const PAYMENT_STATUSES = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED", "CANCELLED"];
export const PAYMENT_METHODS = ["CASH_ON_DELIVERY", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD", "STRIPE", "BANK_TRANSFER"];

export function createOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `JP-${stamp}-${suffix}`;
}

export function normalizePaymentMethod(value) {
  return PAYMENT_METHODS.includes(value) ? value : "CASH_ON_DELIVERY";
}

export function serializeOrder(order) {
  if (!order) return null;

  return {
    ...order,
    subtotal: parseMoney(order.subtotal),
    discountTotal: parseMoney(order.discountTotal),
    deliveryCharge: parseMoney(order.deliveryCharge),
    taxTotal: parseMoney(order.taxTotal),
    total: parseMoney(order.total),
    items: order.items?.map((item) => ({
      ...item,
      unitPrice: parseMoney(item.unitPrice),
      total: parseMoney(item.total),
    })),
    payments: order.payments?.map((payment) => ({
      ...payment,
      amount: parseMoney(payment.amount),
    })),
  };
}

export async function getOrderWithDetails(where) {
  return prisma.order.findFirst({
    where,
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export function orderTotalFromCart(cart) {
  const serialized = serializeCart(cart);
  return {
    count: serialized.count,
    subtotal: serialized.subtotal,
    discountTotal: 0,
    deliveryCharge: serialized.subtotal >= 5000 || serialized.subtotal === 0 ? 0 : 120,
    taxTotal: 0,
    total: serialized.subtotal + (serialized.subtotal >= 5000 || serialized.subtotal === 0 ? 0 : 120),
  };
}
