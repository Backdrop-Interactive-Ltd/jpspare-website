import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";
import { getCustomerReferralDashboard } from "../../../../lib/referrals/customer-referrals";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "http";
  return host ? `${proto}://${host}` : undefined;
}

export async function GET() {
  const session = await getCustomerSession();
  if (!session?.customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dashboard = await getCustomerReferralDashboard({
    customer: session.customer,
    origin: await requestOrigin(),
  });

  return NextResponse.json(dashboard);
}
