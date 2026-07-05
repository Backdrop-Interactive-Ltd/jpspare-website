import { randomInt } from "crypto";
import { prisma as defaultPrisma } from "../db";

const REFERRAL_STATUSES = ["PENDING", "QUALIFIED", "REWARDED", "CANCELLED", "REJECTED"];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function customerName(customer) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || customer?.email || customer?.phone || "Customer";
}

function codePrefix(customer) {
  const source = cleanText(customer?.firstName) || cleanText(customer?.lastName) || cleanText(customer?.email).split("@")[0] || "JPS";
  const prefix = source.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8);
  return prefix || "JPS";
}

function fallbackBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000"
  );
}

function safeBaseUrl(origin) {
  try {
    return new URL(cleanText(origin) || fallbackBaseUrl()).origin;
  } catch {
    return "http://localhost:3000";
  }
}

function generateCandidateCode(customer, attempt) {
  const suffix = String(randomInt(100, 1000));
  if (attempt === 0) return `${codePrefix(customer)}${suffix}`;
  return `${codePrefix(customer)}${suffix}${randomInt(10, 100)}`;
}

async function createUniqueReferralCode(customer, prisma) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateCandidateCode(customer, attempt);
    const existing = await prisma.referralCode.findUnique({ where: { code }, select: { id: true } });
    if (existing) continue;

    try {
      return await prisma.referralCode.create({
        data: {
          customerId: customer.id,
          code,
          isActive: true,
        },
      });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
    }
  }

  throw new Error("Unable to create a unique referral code.");
}

export async function ensureCustomerReferralCode(customer, prisma = defaultPrisma) {
  if (!customer?.id) {
    throw new Error("Customer is required.");
  }

  const existing = await prisma.referralCode.findFirst({
    where: {
      customerId: customer.id,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return existing || createUniqueReferralCode(customer, prisma);
}

function serializeCustomer(customer) {
  if (!customer) return null;
  return {
    id: customer.id,
    name: customerName(customer),
    email: customer.email,
    phone: customer.phone,
  };
}

function serializeRelationship(relationship) {
  const rewardCount = relationship._count?.rewards || relationship.rewards?.length || 0;
  const totalRewardPoints = (relationship.rewards || []).reduce((sum, reward) => sum + (reward.points || 0), 0);

  return {
    id: relationship.id,
    status: relationship.status,
    referredEmail: relationship.referredEmail,
    referredPhone: relationship.referredPhone,
    referredCustomer: serializeCustomer(relationship.referredCustomer),
    qualifyingOrder: relationship.qualifyingOrder
      ? {
          id: relationship.qualifyingOrder.id,
          orderNumber: relationship.qualifyingOrder.orderNumber,
          total: Number(relationship.qualifyingOrder.total || 0),
          status: relationship.qualifyingOrder.status,
        }
      : null,
    rewardCount,
    totalRewardPoints,
    qualifiedAt: relationship.qualifiedAt?.toISOString?.() || null,
    rewardedAt: relationship.rewardedAt?.toISOString?.() || null,
    createdAt: relationship.createdAt?.toISOString?.() || relationship.createdAt,
  };
}

function statusCount(relationships, status) {
  return relationships.filter((relationship) => relationship.status === status).length;
}

export async function getCustomerReferralDashboard({ customer, origin, prisma = defaultPrisma } = {}) {
  if (!customer?.id) {
    throw new Error("Customer is required.");
  }

  const referralCode = await ensureCustomerReferralCode(customer, prisma);
  const relationships = await prisma.referralRelationship.findMany({
    where: {
      referrerCustomerId: customer.id,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      referredCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      qualifyingOrder: { select: { id: true, orderNumber: true, total: true, status: true } },
      rewards: { select: { id: true, points: true, status: true } },
      _count: { select: { rewards: true } },
    },
  });

  const serializedRelationships = relationships.map(serializeRelationship);
  const shareUrl = `${safeBaseUrl(origin)}/signup?ref=${encodeURIComponent(referralCode.code)}`;

  return {
    code: referralCode.code,
    shareUrl,
    stats: {
      totalReferrals: relationships.length,
      pending: statusCount(relationships, "PENDING"),
      qualified: statusCount(relationships, "QUALIFIED"),
      rewarded: statusCount(relationships, "REWARDED"),
      cancelled: statusCount(relationships, "CANCELLED") + statusCount(relationships, "REJECTED"),
      totalRewards: serializedRelationships.reduce((sum, relationship) => sum + relationship.rewardCount, 0),
      totalRewardPoints: serializedRelationships.reduce((sum, relationship) => sum + relationship.totalRewardPoints, 0),
    },
    relationships: serializedRelationships.filter((relationship) => REFERRAL_STATUSES.includes(relationship.status)),
  };
}
