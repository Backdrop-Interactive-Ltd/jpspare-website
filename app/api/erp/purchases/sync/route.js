import { json, requireAdminApi } from "../../../admin/_utils";
import { PURCHASE_MANAGE_ROLES } from "../../../../../lib/admin/purchasePayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const auth = await requireAdminApi(PURCHASE_MANAGE_ROLES);
  if (auth.response) return auth.response;

  return json({
    ok: true,
    status: "placeholder",
    message: "ERP/BMS purchase sync endpoint is ready for future supplier purchase integrations.",
  });
}
