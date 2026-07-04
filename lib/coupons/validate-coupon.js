import { prisma } from "../db";

const supportedDiscountTypes = new Set(["FIXED", "PERCENT"]);

function cleanCode(value) {
  return String(value || "").trim().toUpperCase();
}

function parseMoney(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(typeof value?.toString === "function" ? value.toString() : value);
  return Number.isFinite(number) ? number : null;
}

function moneyNumber(value) {
  return parseMoney(value) ?? 0;
}

function decimalString(value) {
  return moneyNumber(value).toFixed(2);
}

function failure(code, message) {
  return { valid: false, code, message };
}

function success(coupon, subtotal, discountAmount) {
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: decimalString(coupon.discountValue),
    subtotal: decimalString(subtotal),
    discountAmount: decimalString(discountAmount),
    totalAfterDiscount: decimalString(totalAfterDiscount),
    message: "Coupon applied successfully.",
  };
}

export function normalizeCouponValidationInput(body = {}) {
  return {
    code: cleanCode(body.code),
    subtotal: parseMoney(body.subtotal),
    customerId: body.customerId ? String(body.customerId).trim() : null,
    email: body.email ? String(body.email).trim().toLowerCase() : null,
    items: Array.isArray(body.items) ? body.items : [],
  };
}

export function calculateCouponValidation({ coupon, subtotal, now = new Date() }) {
  if (!coupon) return failure("NOT_FOUND", "Coupon was not found.");
  if (!coupon.isActive) return failure("INACTIVE", "Coupon is inactive.");

  const startsAt = coupon.startsAt ? new Date(coupon.startsAt) : null;
  const endsAt = coupon.endsAt ? new Date(coupon.endsAt) : null;

  if (startsAt && startsAt > now) return failure("NOT_STARTED", "Coupon is not active yet.");
  if (endsAt && endsAt < now) return failure("EXPIRED", "Coupon has expired.");
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)) {
    return failure("USAGE_LIMIT_REACHED", "Coupon usage limit has been reached.");
  }

  const minOrderValue = moneyNumber(coupon.minOrderValue);
  if (minOrderValue > 0 && subtotal < minOrderValue) {
    return {
      ...failure("MIN_ORDER_NOT_MET", `Minimum order value for this coupon is ${decimalString(minOrderValue)}.`),
      minOrderValue: decimalString(minOrderValue),
      subtotal: decimalString(subtotal),
    };
  }

  const discountType = String(coupon.discountType || "").toUpperCase();
  if (!supportedDiscountTypes.has(discountType) || moneyNumber(coupon.discountValue) <= 0) {
    return failure("INVALID_REQUEST", "Coupon configuration is invalid.");
  }

  let discountAmount = 0;
  const discountValue = moneyNumber(coupon.discountValue);

  if (discountType === "FIXED") {
    discountAmount = discountValue;
  } else {
    discountAmount = subtotal * (discountValue / 100);
  }

  const maxDiscount = moneyNumber(coupon.maxDiscount);
  if (maxDiscount > 0) {
    discountAmount = Math.min(discountAmount, maxDiscount);
  }

  discountAmount = Math.min(Math.max(0, discountAmount), Math.max(0, subtotal));

  return success({ ...coupon, discountType }, subtotal, discountAmount);
}

export async function validateCouponCode(input) {
  const normalized = normalizeCouponValidationInput(input);

  if (!normalized.code) {
    return failure("INVALID_REQUEST", "Coupon code is required.");
  }

  if (normalized.subtotal === null || normalized.subtotal < 0) {
    return failure("INVALID_REQUEST", "Subtotal must be a valid non-negative number.");
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalized.code },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      minOrderValue: true,
      maxDiscount: true,
      startsAt: true,
      endsAt: true,
      usageLimit: true,
      usedCount: true,
      isActive: true,
    },
  });

  return calculateCouponValidation({
    coupon,
    subtotal: normalized.subtotal,
  });
}
