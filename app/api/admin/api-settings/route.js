import { apiError, json, prisma, requireAdminApi } from "../_utils";
import {
  API_KEY_READ_ROLES,
  API_KEY_WRITE_ROLES,
  apiKeyInclude,
  generateRawApiKey,
  getApiKeyPrefix,
  hashApiKey,
  normalizeApiKeyPayload,
  serializeApiKey,
} from "../../../../lib/admin/apiKeys";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi(API_KEY_READ_ROLES);
  if (auth.response) return auth.response;

  const items = await prisma.apiKey.findMany({
    include: apiKeyInclude(),
    orderBy: { createdAt: "desc" },
  });

  return json({ items: items.map(serializeApiKey) });
}

export async function POST(request) {
  const auth = await requireAdminApi(API_KEY_WRITE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeApiKeyPayload(await request.json().catch(() => ({})));
  if (payload.webhookUrl) {
    try {
      new URL(payload.webhookUrl);
    } catch {
      return apiError("Webhook URL must be a valid URL.", 422);
    }
  }

  const rawKey = generateRawApiKey();
  const item = await prisma.apiKey.create({
    data: {
      name: payload.name,
      keyPrefix: getApiKeyPrefix(rawKey),
      keyHash: hashApiKey(rawKey),
      allowedIps: payload.allowedIps,
      webhookUrl: payload.webhookUrl,
      createdById: auth.session.user.id,
      source: "ADMIN",
      status: "ACTIVE",
    },
    include: apiKeyInclude(),
  });

  return json(
    {
      item: serializeApiKey(item),
      rawKey,
      warning: "Copy this key now. You will not be able to see it again.",
    },
    201
  );
}
