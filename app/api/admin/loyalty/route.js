import { json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parsePage(value) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseLimit(value) {
  const limit = Number.parseInt(value || "20", 10);
  if (!Number.isInteger(limit)) return 20;
  return Math.min(Math.max(limit, 1), 100);
}

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const tier = searchParams.get("tier")?.trim();

  return {
    ...(tier ? { tier } : {}),
    ...(query
      ? {
          OR: [
            { customer: { firstName: { contains: query, mode: "insensitive" } } },
            { customer: { lastName: { contains: query, mode: "insensitive" } } },
            { customer: { email: { contains: query, mode: "insensitive" } } },
            { customer: { phone: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function customerName(customer) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || "Unnamed customer";
}

function serializeAccount(account) {
  const latestLedger = account.ledger?.[0] || null;

  return {
    id: account.id,
    customerId: account.customerId,
    customerName: customerName(account.customer),
    email: account.customer?.email || null,
    phone: account.customer?.phone || null,
    pointsBalance: account.pointsBalance,
    lifetimeEarned: account.lifetimeEarned,
    lifetimeRedeemed: account.lifetimeRedeemed,
    tier: account.tier || null,
    ledgerEntries: account._count?.ledger || 0,
    lastActivityAt: latestLedger?.createdAt?.toISOString?.() || null,
    createdAt: account.createdAt?.toISOString?.() || account.createdAt,
    updatedAt: account.updatedAt?.toISOString?.() || account.updatedAt,
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));
  const where = buildWhere(searchParams);

  const [items, total, summary] = await prisma.$transaction([
    prisma.loyaltyAccount.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        ledger: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        _count: { select: { ledger: true } },
      },
    }),
    prisma.loyaltyAccount.count({ where }),
    prisma.loyaltyAccount.aggregate({
      where,
      _count: { _all: true },
      _sum: {
        pointsBalance: true,
        lifetimeEarned: true,
        lifetimeRedeemed: true,
      },
    }),
  ]);

  return json({
    items: items.map(serializeAccount),
    analytics: {
      totalAccounts: summary._count?._all || 0,
      totalActivePoints: summary._sum?.pointsBalance || 0,
      totalLifetimeEarned: summary._sum?.lifetimeEarned || 0,
      totalLifetimeRedeemed: summary._sum?.lifetimeRedeemed || 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
