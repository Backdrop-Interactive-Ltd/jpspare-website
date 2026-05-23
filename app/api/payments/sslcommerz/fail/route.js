import { NextResponse } from "next/server";
import { readPaymentPayload, updateOrderPaymentFromGateway } from "../../../../../lib/commerce/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleFail(request) {
  const payload = await readPaymentPayload(request);
  const order = await updateOrderPaymentFromGateway({ payload, status: "FAILED" });
  const target = order
    ? `/checkout/success/${order.orderNumber}?payment=failed`
    : "/checkout?payment=failed";

  return NextResponse.redirect(new URL(target, request.url));
}

export async function GET(request) {
  return handleFail(request);
}

export async function POST(request) {
  return handleFail(request);
}
