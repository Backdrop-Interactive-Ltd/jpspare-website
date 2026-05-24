import { apiKeyAuthErrorResponse, verifyApiKeyRequest } from "../../../../lib/apiKeyAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const apiKey = await verifyApiKeyRequest(request);

    return Response.json({
      ok: true,
      authenticated: true,
      keyId: apiKey.id,
      keyName: apiKey.name,
      source: apiKey.source,
      status: apiKey.status,
      lastUsedAt: apiKey.lastUsedAt,
    });
  } catch (error) {
    return apiKeyAuthErrorResponse(error);
  }
}
