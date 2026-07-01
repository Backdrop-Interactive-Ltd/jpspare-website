import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCustomerSession } from "../../../../../lib/auth/customer-session";
import { initiateSslCommerzPayment } from "../../../../../lib/commerce/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const orderId = body.orderId || body.id || null;
  const orderNumber = body.orderNumber || null;
  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json({ error: "Please login before starting payment." }, { status: 401 });
  }

  if (!orderId && !orderNumber) {
    return NextResponse.json({ error: "Order ID or order number is required." }, { status: 422 });
  }

  const order = await prisma.order.findFirst({
    where: { OR: [orderId ? { id: orderId } : null, orderNumber ? { orderNumber } : null].filter(Boolean) },
    include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order was not found." }, { status: 404 });
  }

  if (!order.customerId || order.customerId !== session.customer.id) {
    return NextResponse.json({ error: "You are not allowed to start payment for this order." }, { status: 403 });
  }

  if (order.paymentMethod !== "SSLCOMMERZ") {
    return NextResponse.json({ error: "This order is not configured for SSLCommerz payment." }, { status: 422 });
  }

  const payment = await initiateSslCommerzPayment(order, request);

  return NextResponse.json(payment);
}
