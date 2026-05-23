import { apiError, json, requireAdminApi } from "../../../../_utils";
import { INVOICE_ROLES, markOrderPrinted } from "../../../../../../../lib/commerce/invoice";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const auth = await requireAdminApi(INVOICE_ROLES);
    if (auth.response) return auth.response;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = auth.session?.user?.email || auth.session?.user?.name || "Admin user";
    const documentType = body.documentType === "Packing slip" ? "Packing slip" : "Invoice";
    const order = await markOrderPrinted(id, actor, documentType);

    if (!order) {
      return apiError("Order not found", 404);
    }

    return json({ ok: true, printedAt: order.printedAt });
  } catch (error) {
    return apiError(error?.message || "Unable to mark invoice as printed.");
  }
}
