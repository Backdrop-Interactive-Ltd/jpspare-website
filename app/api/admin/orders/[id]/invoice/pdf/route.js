import { apiError, requireAdminApi } from "../../../../_utils";
import { INVOICE_ROLES, createInvoicePdf, ensureOrderInvoice } from "../../../../../../../lib/commerce/invoice";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const auth = await requireAdminApi(INVOICE_ROLES);
    if (auth.response) return auth.response;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") === "packing-slip" ? "packing-slip" : "invoice";
    const actor = auth.session?.user?.email || auth.session?.user?.name || "Admin user";
    const order = await ensureOrderInvoice(id, actor);

    if (!order) {
      return apiError("Order not found", 404);
    }

    const pdf = createInvoicePdf(order, type);
    const filePrefix = type === "packing-slip" ? "packing-slip" : "invoice";
    const fileId = type === "packing-slip" ? order.orderNumber : order.invoiceNumber;

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filePrefix}-${fileId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error?.message || "Unable to generate invoice PDF.");
  }
}
