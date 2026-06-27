import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: "OTP_LOGIN_REQUIRED",
      message: "Please login with OTP.",
    },
    { status: 410 }
  );
}
