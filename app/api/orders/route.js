import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCustomerSession } from "../../../lib/auth/customer-session";
import { serializeOrder } from "../../../lib/commerce/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: true, payments: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders: orders.map(serializeOrder) });
}
