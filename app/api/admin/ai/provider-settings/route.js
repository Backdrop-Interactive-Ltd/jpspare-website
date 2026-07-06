import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { getAiProviderSettingsPlaceholder } from "../../../../../lib/ai/provider-settings";
import { json, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const settings = getAiProviderSettingsPlaceholder();

  return json({
    configured: settings.configured,
    provider: settings.provider,
    defaultModel: settings.defaultModel,
    embeddingModel: settings.embeddingModel,
    rateLimit: settings.rateLimit,
    monthlyBudget: settings.monthlyBudget,
  });
}
