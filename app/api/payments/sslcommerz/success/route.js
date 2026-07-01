import { NextResponse } from "next/server";
import { readPaymentPayload, updateOrderPaymentFromGateway, validateSslCommerzPayment } from "../../../../../lib/commerce/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleSuccess(request) {
  const payload = await readPaymentPayload(request);
  const validation = await validateSslCommerzPayment(payload);
  const paid = validation.ok;
  const order = await updateOrderPaymentFromGateway({
    payload,
    validation,
    status: paid ? "PAID" : "FAILED",
  });

  const target = order
    ? `/checkout/success/${order.orderNumber}?payment=${paid ? "success" : "failed"}`
    : "/checkout?payment=failed";

  return NextResponse.redirect(new URL(target, request.url));
}

export async function GET(request) {
  return handleSuccess(request);
}

export async function POST(request) {
  return handleSuccess(request);
}
