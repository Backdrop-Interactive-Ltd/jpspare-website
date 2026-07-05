import { prisma as defaultPrisma } from "../db";
import { sendReferralQualificationNotifications, sendReferralRewardNotifications } from "./referral-notifications";

export const DEFAULT_REFERRAL_REWARD_POINTS = 500;

function moneyNumber(value) {
  if (value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

async function getOrCreateLoyaltyAccount(tx, customerId) {
  return (
    (await tx.loyaltyAccount.findUnique({
      where: { customerId },
      select: {
        id: true,
        pointsBalance: true,
        lifetimeEarned: true,
      },
    })) ||
    (await tx.loyaltyAccount.create({
      data: { customerId },
      select: {
        id: true,
        pointsBalance: true,
        lifetimeEarned: true,
      },
    }))
  );
}

export async function issueReferralRewardForDeliveredOrder(orderId, prisma = defaultPrisma) {
  if (!orderId) return { rewarded: false, reason: "MISSING_ORDER_ID" };

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        status: true,
        paymentStatus: true,
        total: true,
      },
    });

    if (!order) return { rewarded: false, reason: "ORDER_NOT_FOUND" };
    if (order.status !== "DELIVERED") return { rewarded: false, reason: "ORDER_NOT_DELIVERED" };
    if (order.status === "CANCELLED" || order.paymentStatus === "REFUNDED") return { rewarded: false, reason: "ORDER_NOT_ELIGIBLE" };
    if (!order.customerId) return { rewarded: false, reason: "GUEST_ORDER" };

    const deliveredOrderCount = await tx.order.count({
      where: {
        customerId: order.customerId,
        status: "DELIVERED",
      },
    });

    if (deliveredOrderCount !== 1) return { rewarded: false, reason: "NOT_FIRST_DELIVERED_ORDER" };

    const relationship = await tx.referralRelationship.findFirst({
      where: {
        referredCustomerId: order.customerId,
        status: { in: ["PENDING", "QUALIFIED"] },
      },
      orderBy: { createdAt: "asc" },
      include: {
        referralCode: { select: { id: true, code: true } },
        referrerCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        referredCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        rewards: {
          where: {
            type: "LOYALTY_POINTS",
            status: { in: ["PENDING", "ISSUED"] },
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!relationship) return { rewarded: false, reason: "REFERRAL_NOT_FOUND" };
    if (!relationship.referrerCustomerId || relationship.referrerCustomerId === order.customerId) {
      return { rewarded: false, reason: "INVALID_REFERRER" };
    }
    if (relationship.rewards.length) return { rewarded: false, reason: "ALREADY_REWARDED" };

    const qualifiedAt = relationship.qualifiedAt || new Date();

    if (relationship.status === "PENDING") {
      await tx.referralRelationship.update({
        where: { id: relationship.id },
        data: {
          status: "QUALIFIED",
          qualifyingOrderId: order.id,
          qualifiedAt,
        },
      });
    }

    const account = await getOrCreateLoyaltyAccount(tx, relationship.referrerCustomerId);
    const balanceAfter = account.pointsBalance + DEFAULT_REFERRAL_REWARD_POINTS;

    const updatedAccount = await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: balanceAfter,
        lifetimeEarned: { increment: DEFAULT_REFERRAL_REWARD_POINTS },
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
        customerId: relationship.referrerCustomerId,
        orderId: order.id,
        type: "ADJUSTMENT_CREDIT",
        points: DEFAULT_REFERRAL_REWARD_POINTS,
        balanceAfter,
        description: "Referral reward",
        metadata: {
          source: "referral_reward",
          relationshipId: relationship.id,
          referredCustomerId: order.customerId,
          orderNumber: order.orderNumber,
          orderTotal: moneyNumber(order.total),
        },
      },
    });

    const reward = await tx.referralReward.create({
      data: {
        relationshipId: relationship.id,
        customerId: relationship.referrerCustomerId,
        orderId: order.id,
        type: "LOYALTY_POINTS",
        status: "ISSUED",
        points: DEFAULT_REFERRAL_REWARD_POINTS,
        value: String(DEFAULT_REFERRAL_REWARD_POINTS),
        description: "Referral reward",
        issuedAt: new Date(),
      },
    });

    const updatedRelationship = await tx.referralRelationship.update({
      where: { id: relationship.id },
      data: {
        status: "REWARDED",
        qualifyingOrderId: order.id,
        qualifiedAt,
        rewardedAt: new Date(),
      },
    });

    await tx.referralCode.update({
      where: { id: relationship.referralCodeId },
      data: { usedCount: { increment: 1 } },
    });

    return {
      rewarded: true,
      points: DEFAULT_REFERRAL_REWARD_POINTS,
      account: updatedAccount,
      ledger,
      reward,
      relationship: updatedRelationship,
      notificationPayload: {
        rewardPoints: DEFAULT_REFERRAL_REWARD_POINTS,
        orderNumber: order.orderNumber,
        referralCode: relationship.referralCode?.code || "",
        referrerCustomer: relationship.referrerCustomer,
        referredCustomer: relationship.referredCustomer,
      },
    };
  });

  if (result.rewarded && result.notificationPayload) {
    try {
      await Promise.all([
        sendReferralRewardNotifications(result.notificationPayload),
        sendReferralQualificationNotifications(result.notificationPayload),
      ]);
    } catch (error) {
      console.error("[ReferralNotifications] Failed to send referral notifications", {
        message: error?.message,
        code: error?.code,
      });
    }
  }

  return result;
}
