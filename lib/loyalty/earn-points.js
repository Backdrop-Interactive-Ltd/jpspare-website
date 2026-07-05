import { prisma as defaultPrisma } from "../db";

function moneyNumber(value) {
  if (value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function calculateEarnedPoints(total) {
  const amount = moneyNumber(total);
  if (amount <= 0) return 0;
  return Math.floor(amount / 100);
}

export async function awardOrderLoyaltyPoints(orderId, prisma = defaultPrisma) {
  if (!orderId) return { awarded: false, reason: "MISSING_ORDER_ID" };

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        status: true,
        paymentStatus: true,
        total: true,
        loyaltyLedger: {
          where: { type: "EARN_ORDER" },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!order) return { awarded: false, reason: "ORDER_NOT_FOUND" };
    if (order.status !== "DELIVERED") return { awarded: false, reason: "ORDER_NOT_DELIVERED" };
    if (order.paymentStatus === "REFUNDED" || order.status === "CANCELLED") return { awarded: false, reason: "ORDER_NOT_ELIGIBLE" };
    if (!order.customerId) return { awarded: false, reason: "GUEST_ORDER" };
    if (order.loyaltyLedger.length) return { awarded: false, reason: "ALREADY_AWARDED" };

    const earnedPoints = calculateEarnedPoints(order.total);
    if (earnedPoints <= 0) return { awarded: false, reason: "ZERO_POINTS" };

    const account =
      (await tx.loyaltyAccount.findUnique({
        where: { customerId: order.customerId },
        select: {
          id: true,
          pointsBalance: true,
        },
      })) ||
      (await tx.loyaltyAccount.create({
        data: { customerId: order.customerId },
        select: {
          id: true,
          pointsBalance: true,
        },
      }));

    const balanceAfter = account.pointsBalance + earnedPoints;

    const updatedAccount = await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: balanceAfter,
        lifetimeEarned: { increment: earnedPoints },
      },
      select: {
        id: true,
        customerId: true,
        pointsBalance: true,
        lifetimeEarned: true,
        lifetimeRedeemed: true,
        tier: true,
      },
    });

    const ledger = await tx.loyaltyLedger.create({
      data: {
        accountId: account.id,
        customerId: order.customerId,
        orderId: order.id,
        type: "EARN_ORDER",
        points: earnedPoints,
        balanceAfter,
        description: `Earned from Order #${order.orderNumber}`,
        metadata: {
          source: "order_delivered",
          orderNumber: order.orderNumber,
          orderTotal: moneyNumber(order.total),
        },
      },
    });

    return {
      awarded: true,
      points: earnedPoints,
      account: updatedAccount,
      ledger,
    };
  });
}
