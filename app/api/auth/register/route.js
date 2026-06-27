import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: "OTP_SIGNUP_REQUIRED",
      message: "Please continue with OTP. Your account will be created automatically after verification.",
    },
    { status: 410 }
  );
}
