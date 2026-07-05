import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";
import { getCustomerNotifications } from "../../../../lib/notifications/customer-notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const session = await getCustomerSession();
  if (!session?.customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const result = await getCustomerNotifications({
    customerId: session.customer.id,
    page,
    limit,
    unreadOnly,
  });

  return NextResponse.json(result);
}
