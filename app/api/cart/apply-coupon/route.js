import { NextResponse } from "next/server";
import { applyCouponToActiveCart } from "../../../../lib/coupons/cart-coupon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await applyCouponToActiveCart(body.code);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Cart coupon apply failed", {
      message: error?.message,
      code: error?.code,
    });
    return NextResponse.json(
      {
        valid: false,
        code: "INVALID_REQUEST",
        message: "Unable to apply coupon right now.",
      },
      { status: 500 }
    );
  }
}
