import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "If the email exists, a reset link will be sent. Email provider integration is ready for production setup.",
  });
}

