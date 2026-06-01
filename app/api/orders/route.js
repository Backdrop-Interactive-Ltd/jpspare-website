import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCustomerSession } from "../../../lib/auth/customer-session";
import { serializeOrder } from "../../../lib/commerce/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = session.customer;
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: true, payments: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders: orders.map(serializeOrder) });
}
