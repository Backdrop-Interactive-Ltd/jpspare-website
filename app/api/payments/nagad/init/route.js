import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error: "Nagad payment is prepared in the payment architecture but is not enabled yet.",
      gateway: "NAGAD",
      enabled: false,
    },
    { status: 501 }
  );
}
