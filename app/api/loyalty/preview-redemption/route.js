import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";
import { getActiveCart } from "../../../../lib/commerce/cart";
import { orderTotalFromCart } from "../../../../lib/commerce/orders";
import { resolveStoredCartCouponValidation } from "../../../../lib/coupons/cart-coupon";
import { normalizeRedeemPoints, previewLoyaltyRedemption } from "../../../../lib/loyalty/redeem-points";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function validationResponse(error, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request) {
  try {
    const session = await getCustomerSession();
    const customer = session?.customer || null;

    if (!customer) {
      return NextResponse.json(
        {
          ok: false,
          code: "LOGIN_REQUIRED",
          message: "Please login before redeeming loyalty points.",
        },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const requestedPoints = normalizeRedeemPoints(body.redeemPoints ?? body.points);

    if (!requestedPoints) {
      return validationResponse("Enter loyalty points to redeem.", 422);
    }

    const cart = await getActiveCart();

    if (!cart || !(cart.items || []).length) {
      return validationResponse("Your cart is empty. Please add products before redeeming points.", 400);
    }

    const couponValidation = await resolveStoredCartCouponValidation(cart, { clearInvalid: false });
    if (couponValidation && !couponValidation.valid) {
      return validationResponse(couponValidation.message || "Applied coupon is no longer valid.", 409);
    }

    const totals = orderTotalFromCart(cart, couponValidation);
    const redemption = await previewLoyaltyRedemption({
      customerId: customer.id,
      requestedPoints,
      payableTotal: totals.total,
    });
    const finalTotals = orderTotalFromCart(cart, couponValidation, redemption);

    return NextResponse.json({
      valid: true,
      requestedPoints: redemption.requestedPoints,
      redeemPoints: redemption.redeemPoints,
      discountAmount: redemption.discountAmount,
      pointsBalance: redemption.pointsBalance,
      remainingBalance: redemption.remainingBalance,
      subtotal: finalTotals.subtotal,
      couponDiscountTotal: finalTotals.couponDiscountTotal,
      loyaltyDiscountTotal: finalTotals.loyaltyDiscountTotal,
      discountTotal: finalTotals.discountTotal,
      deliveryCharge: finalTotals.deliveryCharge,
      totalBeforeLoyalty: finalTotals.totalBeforeLoyalty,
      total: finalTotals.total,
    });
  } catch (error) {
    if (error?.status) {
      return validationResponse(error.message, error.status);
    }

    console.error("Loyalty redemption preview failed", {
      message: error?.message,
      code: error?.code,
    });
    return validationResponse("Unable to preview loyalty redemption right now.", 500);
  }
}
