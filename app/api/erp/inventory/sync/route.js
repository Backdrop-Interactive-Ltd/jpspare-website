import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const expectedToken = process.env.ERP_SYNC_TOKEN;
  const providedToken = request.headers.get("x-erp-token");

  if (expectedToken && providedToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized ERP sync request." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));

  return NextResponse.json(
    {
      status: "accepted",
      message: "Inventory ERP/BMS sync endpoint is ready. Mapping and reconciliation can be connected when the ERP payload contract is finalized.",
      received: {
        items: Array.isArray(payload?.items) ? payload.items.length : 0,
        source: payload?.source || "ERP",
      },
    },
    { status: 202 }
  );
}
