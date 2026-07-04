import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DISCOUNT_TYPES = new Set(["FIXED", "PERCENT"]);

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

function uniqueCodeError(error) {
  return error?.code === "P2002" ? "A coupon with this code already exists." : null;
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const now = new Date();

  const where = {
    ...(query
      ? {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { isActive: true, OR: [{ startsAt: null }, { startsAt: { lte: now } }], AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }] } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(status === "expired" ? { endsAt: { lte: now } } : {}),
    ...(status === "scheduled" ? { isActive: true, startsAt: { gt: now } } : {}),
  };

  const [itemsRaw, total] = await prisma.$transaction([
    prisma.coupon.findMany({
      where,
      include: { _count: { select: { orders: true, redemptions: true } } },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return json({
    items: itemsRaw.map(serializeCoupon),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeCouponPayload(await request.json());
  const error = validateCoupon(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.coupon.create({
      data: payload,
      include: { _count: { select: { orders: true, redemptions: true } } },
    });
    return json({ item: serializeCoupon(item) }, 201);
  } catch (error) {
    const message = uniqueCodeError(error);
    if (message) return apiError(message, 409);
    throw error;
  }
}

