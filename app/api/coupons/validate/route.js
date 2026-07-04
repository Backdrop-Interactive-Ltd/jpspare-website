import { NextResponse } from "next/server";
import { validateCouponCode } from "../../../../lib/coupons/validate-coupon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await validateCouponCode(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Coupon validation failed", {
      message: error?.message,
      code: error?.code,
    });
    return NextResponse.json(
      {
        valid: false,
        code: "INVALID_REQUEST",
        message: "Unable to validate coupon right now.",
      },
      { status: 500 }
    );
  }
}
