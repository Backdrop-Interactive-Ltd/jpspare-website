import { prisma as defaultPrisma } from "../db";

function numberValue(value) {
  const number = Number(typeof value?.toString === "function" ? value.toString() : value);
  return Number.isFinite(number) ? number : 0;
}

export function normalizeRedeemPoints(value) {
  if (value === undefined || value === null || value === "") return 0;
  const points = Number.parseInt(value, 10);
  return Number.isInteger(points) && points > 0 ? points : 0;
}

export function calculateLoyaltyRedemption({ requestedPoints = 0, pointsBalance = 0, payableTotal = 0 } = {}) {
  const requested = normalizeRedeemPoints(requestedPoints);
  const balance = Math.max(0, Number.parseInt(pointsBalance || 0, 10) || 0);
  const payable = Math.max(0, Math.floor(numberValue(payableTotal)));

  if (requested <= 0 || payable <= 0) {
    return {
      requestedPoints: requested,
      redeemPoints: 0,
      discountAmount: 0,
      pointsBalance: balance,
      remainingBalance: balance,
      totalAfterRedemption: numberValue(payableTotal),
    };
  }

  if (requested > balance) {
    const error = new Error("Insufficient loyalty points.");
    error.status = 422;
    throw error;
  }

  const redeemPoints = Math.min(requested, payable);

  return {
    requestedPoints: requested,
    redeemPoints,
    discountAmount: redeemPoints,
    pointsBalance: balance,
    remainingBalance: balance - redeemPoints,
    totalAfterRedemption: Math.max(0, numberValue(payableTotal) - redeemPoints),
  };
}

export async function previewLoyaltyRedemption({ customerId, requestedPoints, payableTotal, prisma = defaultPrisma }) {
  if (!customerId) {
    const error = new Error("Customer login is required to redeem loyalty points.");
    error.status = 401;
    throw error;
  }

  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
    select: {
      id: true,
      pointsBalance: true,
    },
  });

  return calculateLoyaltyRedemption({
    requestedPoints,
    pointsBalance: account?.pointsBalance || 0,
    payableTotal,
  });
}

export async function redeemOrderLoyaltyPoints({ tx, customerId, orderId, orderNumber, requestedPoints, payableTotal }) {
  const prisma = tx || defaultPrisma;
  const points = normalizeRedeemPoints(requestedPoints);

  if (!points) return { redeemed: false, reason: "NO_POINTS" };
  if (!customerId) {
    const error = new Error("Customer login is required to redeem loyalty points.");
    error.status = 401;
    throw error;
  }

  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
    select: {
      id: true,
      pointsBalance: true,
    },
  });

  if (!account) {
    const error = new Error("No loyalty wallet was found for this customer.");
    error.status = 422;
    throw error;
  }

  const existing = orderId
    ? await prisma.loyaltyLedger.findFirst({
        where: {
          orderId,
          type: "REDEEM_ORDER",
        },
        select: { id: true },
      })
    : null;

  if (existing) return { redeemed: false, reason: "ALREADY_REDEEMED" };

  const redemption = calculateLoyaltyRedemption({
    requestedPoints: points,
    pointsBalance: account.pointsBalance,
    payableTotal,
  });

  if (!redemption.redeemPoints) return { redeemed: false, reason: "ZERO_POINTS" };

  const balanceAfter = account.pointsBalance - redemption.redeemPoints;

  const updatedAccount = await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: {
      pointsBalance: balanceAfter,
      lifetimeRedeemed: { increment: redemption.redeemPoints },
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

  const ledger = await prisma.loyaltyLedger.create({
    data: {
      accountId: account.id,
      customerId,
      orderId,
      type: "REDEEM_ORDER",
      points: -redemption.redeemPoints,
      balanceAfter,
      description: `Redeemed for Order #${orderNumber}`,
      metadata: {
        source: "checkout_redemption",
        orderNumber,
        requestedPoints: redemption.requestedPoints,
        discountAmount: redemption.discountAmount,
      },
    },
  });

  return {
    redeemed: true,
    redemption,
    account: updatedAccount,
    ledger,
  };
}
