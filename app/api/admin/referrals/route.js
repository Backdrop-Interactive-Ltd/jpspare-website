import { json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REFERRAL_STATUSES = ["PENDING", "QUALIFIED", "REWARDED", "CANCELLED", "REJECTED"];

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
  const status = searchParams.get("status") || "";
  const code = searchParams.get("code")?.trim();
  const referrer = searchParams.get("referrer")?.trim();
  const referred = searchParams.get("referred")?.trim();

  return {
    ...(REFERRAL_STATUSES.includes(status) ? { status } : {}),
    ...(code ? { referralCode: { code: { contains: code, mode: "insensitive" } } } : {}),
    ...(referrer
      ? {
          OR: [
            { referrerCustomer: { firstName: { contains: referrer, mode: "insensitive" } } },
            { referrerCustomer: { lastName: { contains: referrer, mode: "insensitive" } } },
            { referrerCustomer: { email: { contains: referrer, mode: "insensitive" } } },
            { referrerCustomer: { phone: { contains: referrer, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(referred
      ? {
          OR: [
            { referredEmail: { contains: referred, mode: "insensitive" } },
            { referredPhone: { contains: referred, mode: "insensitive" } },
            { referredCustomer: { firstName: { contains: referred, mode: "insensitive" } } },
            { referredCustomer: { lastName: { contains: referred, mode: "insensitive" } } },
            { referredCustomer: { email: { contains: referred, mode: "insensitive" } } },
            { referredCustomer: { phone: { contains: referred, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function customerName(customer) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || customer?.email || customer?.phone || "Unknown customer";
}

function serializeRelationship(referral) {
  return {
    id: referral.id,
    status: referral.status,
    createdAt: referral.createdAt?.toISOString?.() || referral.createdAt,
    qualifiedAt: referral.qualifiedAt?.toISOString?.() || null,
    rewardedAt: referral.rewardedAt?.toISOString?.() || null,
    referredEmail: referral.referredEmail,
    referredPhone: referral.referredPhone,
    referralCode: referral.referralCode
      ? {
          id: referral.referralCode.id,
          code: referral.referralCode.code,
          isActive: referral.referralCode.isActive,
          usedCount: referral.referralCode.usedCount,
          usageLimit: referral.referralCode.usageLimit,
        }
      : null,
    referrer: referral.referrerCustomer
      ? {
          id: referral.referrerCustomer.id,
          name: customerName(referral.referrerCustomer),
          email: referral.referrerCustomer.email,
          phone: referral.referrerCustomer.phone,
        }
      : null,
    referredCustomer: referral.referredCustomer
      ? {
          id: referral.referredCustomer.id,
          name: customerName(referral.referredCustomer),
          email: referral.referredCustomer.email,
          phone: referral.referredCustomer.phone,
        }
      : null,
    qualifyingOrder: referral.qualifyingOrder
      ? {
          id: referral.qualifyingOrder.id,
          orderNumber: referral.qualifyingOrder.orderNumber,
          total: Number(referral.qualifyingOrder.total || 0),
          status: referral.qualifyingOrder.status,
        }
      : null,
    rewardCount: referral._count?.rewards || 0,
  };
}

function statusCount(counts, status) {
  return counts.find((item) => item.status === status)?._count?._all || 0;
}

async function getTopReferrers(where) {
  const groups = await prisma.referralRelationship.groupBy({
    by: ["referrerCustomerId"],
    where,
    _count: { _all: true },
    orderBy: { _count: { referrerCustomerId: "desc" } },
    take: 10,
  });
  const ids = groups.map((item) => item.referrerCustomerId);

  if (!ids.length) return [];

  const customers = await prisma.customer.findMany({
    where: { id: { in: ids } },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));

  return groups.map((item) => {
    const customer = customerMap.get(item.referrerCustomerId);
    return {
      customerId: item.referrerCustomerId,
      name: customerName(customer),
      email: customer?.email || null,
      phone: customer?.phone || null,
      referralCount: item._count?._all || 0,
    };
  });
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));
  const where = buildWhere(searchParams);

  const [items, total, statusCounts] = await prisma.$transaction([
    prisma.referralRelationship.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        referralCode: true,
        referrerCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        referredCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        qualifyingOrder: { select: { id: true, orderNumber: true, total: true, status: true } },
        _count: { select: { rewards: true } },
      },
    }),
    prisma.referralRelationship.count({ where }),
    prisma.referralRelationship.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
  ]);
  const topReferrers = await getTopReferrers(where);

  const qualified = statusCount(statusCounts, "QUALIFIED");
  const rewarded = statusCount(statusCounts, "REWARDED");
  const converted = qualified + rewarded;

  return json({
    items: items.map(serializeRelationship),
    analytics: {
      totalReferrals: total,
      pending: statusCount(statusCounts, "PENDING"),
      qualified,
      rewarded,
      cancelled: statusCount(statusCounts, "CANCELLED"),
      rejected: statusCount(statusCounts, "REJECTED"),
      conversionRate: total ? Math.round((converted / total) * 100) : 0,
      topReferrers,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
