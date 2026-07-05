import { prisma as defaultPrisma } from "../db";

const ADJUSTMENT_TYPES = new Set(["ADJUSTMENT_CREDIT", "ADJUSTMENT_DEBIT"]);

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean : null;
}

export function normalizeLoyaltyAdjustmentPayload(body = {}) {
  const points = Number.parseInt(body.points, 10);

  return {
    type: ADJUSTMENT_TYPES.has(body.type) ? body.type : null,
    points: Number.isInteger(points) ? points : null,
    description: cleanString(body.description),
  };
}

export function validateLoyaltyAdjustment(payload) {
  if (!payload.type) return "Adjustment type must be ADJUSTMENT_CREDIT or ADJUSTMENT_DEBIT.";
  if (!Number.isInteger(payload.points) || payload.points <= 0) return "Points must be a positive whole number.";
  if (!payload.description) return "Adjustment description is required.";
  return null;
}

export async function adjustLoyaltyPoints({ customerId, type, points, description, prisma = defaultPrisma }) {
  const validationError = validateLoyaltyAdjustment({ type, points, description });
  if (validationError) {
    const error = new Error(validationError);
    error.status = 422;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        loyaltyAccount: {
          select: {
            id: true,
            pointsBalance: true,
            lifetimeEarned: true,
            lifetimeRedeemed: true,
          },
        },
      },
    });

    if (!customer) {
      const error = new Error("Customer not found.");
      error.status = 404;
      throw error;
    }

    const account =
      customer.loyaltyAccount ||
      (type === "ADJUSTMENT_CREDIT"
        ? await tx.loyaltyAccount.create({
            data: { customerId: customer.id },
            select: {
              id: true,
              pointsBalance: true,
              lifetimeEarned: true,
              lifetimeRedeemed: true,
            },
          })
        : null);

    if (!account) {
      const error = new Error("Customer does not have a loyalty wallet to debit.");
      error.status = 422;
      throw error;
    }

    const signedPoints = type === "ADJUSTMENT_CREDIT" ? points : -points;
    const balanceAfter = account.pointsBalance + signedPoints;

    if (balanceAfter < 0) {
      const error = new Error("Insufficient loyalty points for this debit.");
      error.status = 422;
      throw error;
    }

    const updatedAccount = await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: balanceAfter,
        lifetimeEarned: type === "ADJUSTMENT_CREDIT" ? { increment: points } : undefined,
        lifetimeRedeemed: type === "ADJUSTMENT_DEBIT" ? { increment: points } : undefined,
      },
      select: {
        id: true,
        customerId: true,
        pointsBalance: true,
        lifetimeEarned: true,
        lifetimeRedeemed: true,
        tier: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const ledger = await tx.loyaltyLedger.create({
      data: {
        accountId: account.id,
        customerId: customer.id,
        type,
        points: signedPoints,
        balanceAfter,
        description,
        metadata: {
          source: "manual_admin_adjustment",
        },
      },
    });

    return {
      account: updatedAccount,
      ledger,
    };
  });
}
