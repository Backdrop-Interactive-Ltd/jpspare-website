import { seedFrontendCategories } from "../../../../../lib/admin/categorySeed";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { apiError, json, prisma, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  try {
    const stats = await seedFrontendCategories(prisma);
    return json({ ok: true, ...stats });
  } catch (error) {
    console.error("Frontend category seed failed", error);
    return apiError("Unable to import frontend categories.", 500);
  }
}
