import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error: "Card payments are prepared through the Stripe-ready payment architecture but are not enabled yet.",
      gateway: "STRIPE",
      enabled: false,
    },
    { status: 501 },
  );
}
