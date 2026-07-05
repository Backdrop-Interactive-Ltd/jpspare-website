import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const referralId = async (context) => (await context.params).id;

function customerName(customer) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || customer?.email || customer?.phone || "Unknown customer";
}

function serializeCustomer(customer) {
  if (!customer) return null;
  return {
    id: customer.id,
    name: customerName(customer),
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    createdAt: customer.createdAt?.toISOString?.() || customer.createdAt,
  };
}

function serializeReward(reward) {
  return {
    id: reward.id,
    type: reward.type,
    status: reward.status,
    points: reward.points,
    value: reward.value,
    description: reward.description,
    issuedAt: reward.issuedAt?.toISOString?.() || null,
    createdAt: reward.createdAt?.toISOString?.() || reward.createdAt,
    coupon: reward.coupon
      ? {
          id: reward.coupon.id,
          code: reward.coupon.code,
        }
      : null,
    order: reward.order
      ? {
          id: reward.order.id,
          orderNumber: reward.order.orderNumber,
        }
      : null,
  };
}

function serializeReferral(referral) {
  return {
    id: referral.id,
    status: referral.status,
    referredEmail: referral.referredEmail,
    referredPhone: referral.referredPhone,
    qualifiedAt: referral.qualifiedAt?.toISOString?.() || null,
    rewardedAt: referral.rewardedAt?.toISOString?.() || null,
    createdAt: referral.createdAt?.toISOString?.() || referral.createdAt,
    updatedAt: referral.updatedAt?.toISOString?.() || referral.updatedAt,
    referralCode: referral.referralCode
      ? {
          id: referral.referralCode.id,
          code: referral.referralCode.code,
          isActive: referral.referralCode.isActive,
          usageLimit: referral.referralCode.usageLimit,
          usedCount: referral.referralCode.usedCount,
          createdAt: referral.referralCode.createdAt?.toISOString?.() || referral.referralCode.createdAt,
        }
      : null,
    referrer: serializeCustomer(referral.referrerCustomer),
    referredCustomer: serializeCustomer(referral.referredCustomer),
    qualifyingOrder: referral.qualifyingOrder
      ? {
          id: referral.qualifyingOrder.id,
          orderNumber: referral.qualifyingOrder.orderNumber,
          status: referral.qualifyingOrder.status,
          paymentStatus: referral.qualifyingOrder.paymentStatus,
          total: Number(referral.qualifyingOrder.total || 0),
          createdAt: referral.qualifyingOrder.createdAt?.toISOString?.() || referral.qualifyingOrder.createdAt,
        }
      : null,
    rewards: (referral.rewards || []).map(serializeReward),
    timeline: [
      { label: "Created", at: referral.createdAt?.toISOString?.() || referral.createdAt },
      { label: "Qualified", at: referral.qualifiedAt?.toISOString?.() || null },
      { label: "Rewarded", at: referral.rewardedAt?.toISOString?.() || null },
    ],
  };
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const referral = await prisma.referralRelationship.findUnique({
    where: { id: await referralId(context) },
    include: {
      referralCode: true,
      referrerCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, createdAt: true } },
      referredCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, createdAt: true } },
      qualifyingOrder: { select: { id: true, orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true } },
      rewards: {
        orderBy: { createdAt: "desc" },
        include: {
          coupon: { select: { id: true, code: true } },
          order: { select: { id: true, orderNumber: true } },
        },
      },
    },
  });

  if (!referral) return apiError("Referral relationship not found.", 404);

  return json({ referral: serializeReferral(referral) });
}
