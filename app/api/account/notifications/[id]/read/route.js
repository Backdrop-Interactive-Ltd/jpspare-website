import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../../../lib/auth/customer-session";
import { markNotificationAsRead } from "../../../../../../lib/notifications/customer-notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request, { params }) {
  const session = await getCustomerSession();
  if (!session?.customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const notification = await markNotificationAsRead({
    customerId: session.customer.id,
    notificationId: id,
  });

  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json({ notification });
}
