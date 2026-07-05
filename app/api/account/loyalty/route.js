import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeLedger(entry) {
  return {
    id: entry.id,
    type: entry.type,
    points: entry.points,
    balanceAfter: entry.balanceAfter,
    description: entry.description,
    expiresAt: entry.expiresAt?.toISOString?.() || null,
    createdAt: entry.createdAt?.toISOString?.() || entry.createdAt,
    order: entry.order
      ? {
          id: entry.order.id,
          orderNumber: entry.order.orderNumber,
        }
      : null,
  };
}

function buildAnalytics(account, ledger, totalTransactions, earnedSummary) {
  const earnedTransactions = earnedSummary?._count?._all || ledger.filter((entry) => entry.points > 0).length;
  const totalEarnedFromOrders = earnedSummary?._sum?.points || 0;

  return {
    totalTransactions,
    earnedTransactions,
    redeemedTransactions: ledger.filter((entry) => entry.points < 0).length,
    cashValue: account?.pointsBalance || 0,
    netLifetimeValue: (account?.lifetimeEarned || 0) - (account?.lifetimeRedeemed || 0),
    averagePointsEarnedPerOrder: earnedTransactions ? Math.round(totalEarnedFromOrders / earnedTransactions) : 0,
  };
}

export async function GET() {
  const session = await getCustomerSession();
  if (!session?.customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [account, earnedSummary] = await prisma.$transaction([
    prisma.loyaltyAccount.findUnique({
      where: { customerId: session.customer.id },
      select: {
        pointsBalance: true,
        lifetimeEarned: true,
        lifetimeRedeemed: true,
        tier: true,
        ledger: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            type: true,
            points: true,
            balanceAfter: true,
            description: true,
            expiresAt: true,
            createdAt: true,
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
        },
        _count: { select: { ledger: true } },
      },
    }),
    prisma.loyaltyLedger.aggregate({
      where: {
        customerId: session.customer.id,
        type: "EARN_ORDER",
      },
      _count: { _all: true },
      _sum: { points: true },
    }),
  ]);

  const ledger = account?.ledger || [];

  return NextResponse.json({
    account: account
      ? {
          pointsBalance: account.pointsBalance,
          lifetimeEarned: account.lifetimeEarned,
          lifetimeRedeemed: account.lifetimeRedeemed,
          tier: account.tier,
        }
      : null,
    analytics: buildAnalytics(account, ledger, account?._count?.ledger || 0, earnedSummary),
    ledger: ledger.map(serializeLedger),
  });
}
