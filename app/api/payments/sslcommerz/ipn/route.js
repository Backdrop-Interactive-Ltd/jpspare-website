import { NextResponse } from "next/server";
import { readPaymentPayload, updateOrderPaymentFromGateway, validateSslCommerzPayment } from "../../../../../lib/commerce/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const payload = await readPaymentPayload(request);
  const validation = await validateSslCommerzPayment(payload);
  const paid = validation.ok;
  const order = await updateOrderPaymentFromGateway({
    payload,
    validation,
    status: paid ? "PAID" : "FAILED",
  });

  return NextResponse.json({
    ok: Boolean(order),
    orderNumber: order?.orderNumber || null,
    paymentStatus: order?.paymentStatus || null,
  });
}
