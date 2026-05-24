import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import {
  API_KEY_WRITE_ROLES,
  apiKeyInclude,
  normalizeApiKeyPayload,
  serializeApiKey,
} from "../../../../../lib/admin/apiKeys";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getId = async (context) => (await context.params).id;
const ALLOWED_STATUSES = new Set(["ACTIVE", "INACTIVE", "REVOKED"]);

export async function PATCH(request, context) {
  const auth = await requireAdminApi(API_KEY_WRITE_ROLES);
  if (auth.response) return auth.response;

  const apiKeyId = await getId(context);
  const body = await request.json().catch(() => ({}));
  const status = body.action === "revoke" ? "REVOKED" : body.status;
  const payload = normalizeApiKeyPayload(body);

  if (status && !ALLOWED_STATUSES.has(status)) return apiError("Invalid API key status.", 422);
  if (payload.webhookUrl) {
    try {
      new URL(payload.webhookUrl);
    } catch {
      return apiError("Webhook URL must be a valid URL.", 422);
    }
  }

  const existing = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });
  if (!existing) return apiError("API key not found.", 404);

  const item = await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: {
      ...(body.name !== undefined ? { name: payload.name } : {}),
      ...(body.allowedIps !== undefined ? { allowedIps: payload.allowedIps } : {}),
      ...(body.webhookUrl !== undefined ? { webhookUrl: payload.webhookUrl } : {}),
      ...(status
        ? {
            status,
            revokedAt: status === "REVOKED" ? new Date() : null,
          }
        : {}),
    },
    include: apiKeyInclude(),
  });

  return json({ item: serializeApiKey(item) });
}
