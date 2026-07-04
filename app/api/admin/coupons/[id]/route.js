import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DISCOUNT_TYPES = new Set(["FIXED", "PERCENT"]);
const id = async (context) => (await context.params).id;

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean : null;
}

function decimalString(value) {
  const clean = cleanString(value);
  if (!clean) return null;
  const number = Number(clean);
  return Number.isFinite(number) ? clean : null;
}

function intValue(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function dateValue(value) {
  const clean = cleanString(value);
  if (!clean) return null;
  const date = new Date(clean);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeCouponPayload(body = {}) {
  const code = cleanString(body.code)?.toUpperCase() || null;
  const discountType = cleanString(body.discountType)?.toUpperCase() || "FIXED";
  const startsAt = dateValue(body.startsAt);
  const endsAt = dateValue(body.endsAt || body.expiresAt);

  return {
    code,
    description: cleanString(body.description),
    discountType,
    discountValue: decimalString(body.discountValue),
    minOrderValue: decimalString(body.minOrderValue),
    maxDiscount: decimalString(body.maxDiscount),
    startsAt,
    endsAt,
    usageLimit: intValue(body.usageLimit),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

function validateCoupon(payload) {
  if (!payload.code) return "Coupon code is required.";
  if (!DISCOUNT_TYPES.has(payload.discountType)) return "Discount type must be FIXED or PERCENT.";
  if (!payload.discountValue || Number(payload.discountValue) <= 0) return "Discount value must be greater than zero.";
  if (payload.minOrderValue !== null && Number(payload.minOrderValue) < 0) return "Minimum order value cannot be negative.";
  if (payload.maxDiscount !== null && Number(payload.maxDiscount) < 0) return "Maximum discount cannot be negative.";
  if (payload.usageLimit !== null && payload.usageLimit < 0) return "Usage limit cannot be negative.";
  if (payload.startsAt && payload.endsAt && payload.endsAt <= payload.startsAt) return "Expiry date must be after start date.";
  return null;
}

function serializeCoupon(coupon) {
  if (!coupon) return null;
  return {
    ...coupon,
    discountValue: coupon.discountValue?.toString?.() ?? coupon.discountValue,
    minOrderValue: coupon.minOrderValue?.toString?.() ?? coupon.minOrderValue,
    maxDiscount: coupon.maxDiscount?.toString?.() ?? coupon.maxDiscount,
    startsAt: coupon.startsAt?.toISOString?.() ?? coupon.startsAt,
    endsAt: coupon.endsAt?.toISOString?.() ?? coupon.endsAt,
    createdAt: coupon.createdAt?.toISOString?.() ?? coupon.createdAt,
    updatedAt: coupon.updatedAt?.toISOString?.() ?? coupon.updatedAt,
  };
}

function serializeRedemption(redemption) {
  if (!redemption) return null;
  return {
    id: redemption.id,
    orderId: redemption.orderId,
    customerId: redemption.customerId,
    customerName: redemption.customer?.name || null,
    email: redemption.email || redemption.customer?.email || null,
    phone: redemption.phone || redemption.customer?.phone || null,
    code: redemption.code,
    discountAmount: redemption.discountAmount?.toString?.() ?? redemption.discountAmount,
    status: redemption.status,
    redeemedAt: redemption.redeemedAt?.toISOString?.() ?? redemption.redeemedAt,
  };
}

function uniqueCodeError(error) {
  return error?.code === "P2002" ? "A coupon with this code already exists." : null;
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.coupon.findUnique({
    where: { id: await id(context) },
    include: { _count: { select: { orders: true, redemptions: true } } },
  });
  if (!item) return apiError("Coupon not found.", 404);
  const [analytics, latestRedemptions] = await Promise.all([
    prisma.couponRedemption.aggregate({
      where: { couponId: item.id },
      _count: { _all: true },
      _sum: { discountAmount: true },
    }),
    prisma.couponRedemption.findMany({
      where: { couponId: item.id },
      include: { customer: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { redeemedAt: "desc" },
      take: 10,
    }),
  ]);

  return json({
    item: {
      ...serializeCoupon(item),
      analytics: {
        totalRedemptions: analytics._count?._all || 0,
        totalDiscountGiven: analytics._sum?.discountAmount?.toString?.() ?? analytics._sum?.discountAmount ?? "0",
        latestRedemptions: latestRedemptions.map(serializeRedemption),
      },
    },
  });
}

async function updateCoupon(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeCouponPayload(await request.json());
  const error = validateCoupon(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.coupon.update({
      where: { id: await id(context) },
      data: payload,
      include: { _count: { select: { orders: true, redemptions: true } } },
    });
    return json({ item: serializeCoupon(item) });
  } catch (error) {
    const message = uniqueCodeError(error);
    if (message) return apiError(message, 409);
    if (error?.code === "P2025") return apiError("Coupon not found.", 404);
    throw error;
  }
}

export async function PUT(request, context) {
  return updateCoupon(request, context);
}

export async function PATCH(request, context) {
  return updateCoupon(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const couponId = await id(context);
  const [orderCount, redemptionCount] = await Promise.all([
    prisma.order.count({ where: { couponId } }),
    prisma.couponRedemption.count({ where: { couponId } }),
  ]);

  if (orderCount > 0 || redemptionCount > 0) {
    return apiError("Cannot delete a coupon that has orders or redemptions.", 409);
  }

  try {
    await prisma.coupon.delete({ where: { id: couponId } });
    return json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") return apiError("Coupon not found.", 404);
    throw error;
  }
}
