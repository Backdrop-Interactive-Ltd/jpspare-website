import { NextResponse } from "next/server";
import { readPaymentPayload, updateOrderPaymentFromGateway } from "../../../../../lib/commerce/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleCancel(request) {
  const payload = await readPaymentPayload(request);
  const order = await updateOrderPaymentFromGateway({ payload, status: "CANCELLED" });
  const target = order
    ? `/checkout/success/${order.orderNumber}?payment=cancelled`
    : "/checkout?payment=cancelled";

  return NextResponse.redirect(new URL(target, request.url));
}

export async function GET(request) {
  return handleCancel(request);
}

export async function POST(request) {
  return handleCancel(request);
}
