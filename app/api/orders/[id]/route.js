import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";
import { getOrderWithDetails, serializeOrder } from "../../../../lib/commerce/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = session.customer;
  const { id } = await params;
  const order = await getOrderWithDetails({
    customerId: customer.id,
    OR: [{ id }, { orderNumber: id }],
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: serializeOrder(order) });
}
