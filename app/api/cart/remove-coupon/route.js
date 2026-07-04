import { NextResponse } from "next/server";
import { removeCouponFromActiveCart } from "../../../../lib/coupons/cart-coupon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE() {
  try {
    const result = await removeCouponFromActiveCart();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cart coupon remove failed", {
      message: error?.message,
      code: error?.code,
    });
    return NextResponse.json(
      {
        valid: false,
        code: "INVALID_REQUEST",
        message: "Unable to remove coupon right now.",
      },
      { status: 500 }
    );
  }
}
