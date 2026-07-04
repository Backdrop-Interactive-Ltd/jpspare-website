import { cookies } from "next/headers";
import { getActiveCart, serializeCart } from "../commerce/cart";
import { validateCouponCode } from "./validate-coupon";

const CART_COUPON_COOKIE = "jpspare_cart_coupon";

function numberValue(value) {
  const number = Number(typeof value?.toString === "function" ? value.toString() : value);
  return Number.isFinite(number) ? number : 0;
}

function moneyString(value) {
  return numberValue(value).toFixed(2);
}

function moneyNumber(value) {
  return Number(moneyString(value));
}

function cartItemsForCoupon(cart) {
  return (cart?.items || []).map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: numberValue(item.unitPrice),
  }));
}

function couponFromResult(result) {
  if (!result?.valid) return null;

  return {
    id: result.couponId,
    code: result.code,
    discountType: result.discountType,
    discountValue: result.discountValue,
    discountAmount: result.discountAmount,
  };
}

function parseStoredCoupon(value) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function getStoredCoupon() {
  const cookieStore = await cookies();
  return parseStoredCoupon(cookieStore.get(CART_COUPON_COOKIE)?.value);
}

async function saveStoredCoupon(cart, validation) {
  const cookieStore = await cookies();
  cookieStore.set(
    CART_COUPON_COOKIE,
    JSON.stringify({
      cartId: cart.id,
      couponId: validation.couponId,
      code: validation.code,
      discountType: validation.discountType,
      discountValue: validation.discountValue,
      discountAmount: validation.discountAmount,
      subtotal: validation.subtotal,
      totalAfterDiscount: validation.totalAfterDiscount,
      appliedAt: new Date().toISOString(),
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    }
  );
}

export async function clearStoredCartCoupon() {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COUPON_COOKIE);
}

export function buildCartPricingSummary(cart, validation = null) {
  const serialized = serializeCart(cart);
  const subtotal = numberValue(serialized.subtotal);
  const discountTotal = validation?.valid ? numberValue(validation.discountAmount) : 0;
  const totalAfterDiscount = Math.max(0, subtotal - discountTotal);

  return {
    ...serialized,
    discountTotal: moneyNumber(discountTotal),
    totalAfterDiscount: moneyNumber(totalAfterDiscount),
    coupon: couponFromResult(validation),
  };
}

export async function serializeCartWithCoupon(cart) {
  if (!cart?.id || !(cart.items || []).length) {
    return buildCartPricingSummary(cart);
  }

  const validation = await resolveStoredCartCouponValidation(cart);
  if (!validation?.valid) {
    return buildCartPricingSummary(cart);
  }

  return buildCartPricingSummary(cart, validation);
}

export async function resolveStoredCartCouponValidation(cart, { clearInvalid = true } = {}) {
  if (!cart?.id || !(cart.items || []).length) {
    return null;
  }

  const storedCoupon = await getStoredCoupon();
  if (!storedCoupon?.code || storedCoupon.cartId !== cart.id) {
    return null;
  }

  const serialized = serializeCart(cart);
  const validation = await validateCouponCode({
    code: storedCoupon.code,
    subtotal: serialized.subtotal,
    items: cartItemsForCoupon(cart),
  });

  if (!validation.valid) {
    if (clearInvalid) {
      await clearStoredCartCoupon();
    }
    return validation;
  }

  await saveStoredCoupon(cart, validation);
  return validation;
}

export async function applyCouponToActiveCart(code) {
  const cart = await getActiveCart();
  const serialized = serializeCart(cart);

  if (!cart?.id || !(cart.items || []).length) {
    await clearStoredCartCoupon();
    return {
      ok: false,
      status: 400,
      body: {
        valid: false,
        code: "EMPTY_CART",
        message: "Your cart is empty.",
        cart: buildCartPricingSummary(cart),
      },
    };
  }

  const validation = await validateCouponCode({
    code,
    subtotal: serialized.subtotal,
    items: cartItemsForCoupon(cart),
  });

  if (!validation.valid) {
    await clearStoredCartCoupon();
    return {
      ok: false,
      status: 400,
      body: {
        ...validation,
        cart: buildCartPricingSummary(cart),
      },
    };
  }

  await saveStoredCoupon(cart, validation);

  return {
    ok: true,
    status: 200,
    body: {
      ...validation,
      cart: buildCartPricingSummary(cart, validation),
    },
  };
}

export async function removeCouponFromActiveCart() {
  const cart = await getActiveCart();
  await clearStoredCartCoupon();

  return {
    cart: buildCartPricingSummary(cart),
  };
}
