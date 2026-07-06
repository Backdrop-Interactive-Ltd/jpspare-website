import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { getAiSafetySettingsPlaceholder } from "../../../../../lib/ai/safety-settings";
import { json, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const settings = getAiSafetySettingsPlaceholder();

  return json({
    executionEnabled: settings.executionEnabled,
    humanApprovalRequired: settings.humanApprovalRequired,
    emergencyStop: settings.emergencyStop,
    readOnlyMode: settings.readOnlyMode,
    policies: settings.policies,
    limits: settings.limits,
  });
}
