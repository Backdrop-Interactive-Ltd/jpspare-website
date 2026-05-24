import { prisma } from "./db";
import { getApiKeyPrefix, hashApiKey } from "./admin/apiKeys";

export class ApiKeyAuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiKeyAuthError";
    this.status = status;
    this.code = code;
  }
}

export function extractApiKey(request) {
  const authorization = request.headers.get("authorization") || "";
  const [scheme, ...rest] = authorization.trim().split(/\s+/);

  if (scheme?.toLowerCase() === "bearer" && rest.length > 0) {
    return rest.join(" ").trim();
  }

  const headerKey = request.headers.get("x-api-key");
  return headerKey ? headerKey.trim() : null;
}

function normalizeAllowedIps(allowedIps) {
  if (!allowedIps) return [];
  return String(allowedIps)
    .split(/[\s,]+/)
    .map((ip) => ip.trim())
    .filter(Boolean);
}

function normalizeIp(ip) {
  if (!ip) return null;
  return ip.trim().replace(/^::ffff:/, "");
}

function getRequestIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return normalizeIp(forwardedFor.split(",")[0]);

  return (
    normalizeIp(request.headers.get("x-real-ip")) ||
    normalizeIp(request.headers.get("cf-connecting-ip"))
  );
}

function assertAllowedIp(apiKey, request) {
  const allowedIps = normalizeAllowedIps(apiKey.allowedIps);
  if (allowedIps.length === 0 || allowedIps.includes("*")) return;

  const requestIp = getRequestIp(request);
  if (!requestIp || !allowedIps.map(normalizeIp).includes(requestIp)) {
    throw new ApiKeyAuthError(403, "API_KEY_IP_NOT_ALLOWED", "API key is not allowed from this IP.");
  }
}

export async function verifyApiKeyRequest(request) {
  const rawKey = extractApiKey(request);
  if (!rawKey) {
    throw new ApiKeyAuthError(401, "API_KEY_MISSING", "API key is required.");
  }

  try {
    const keyPrefix = getApiKeyPrefix(rawKey);
    const keyHash = hashApiKey(rawKey);
    const candidates = await prisma.apiKey.findMany({
      where: { keyPrefix },
      select: {
        id: true,
        name: true,
        keyHash: true,
        status: true,
        allowedIps: true,
        source: true,
        lastUsedAt: true,
      },
    });

    const apiKey = candidates.find((candidate) => candidate.keyHash === keyHash);
    if (!apiKey) {
      throw new ApiKeyAuthError(401, "API_KEY_INVALID", "Invalid API key.");
    }

    if (apiKey.status !== "ACTIVE") {
      throw new ApiKeyAuthError(403, "API_KEY_INACTIVE", "API key is not active.");
    }

    assertAllowedIp(apiKey, request);

    const updated = await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        source: true,
        lastUsedAt: true,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      keyPrefix: updated.keyPrefix,
      status: updated.status,
      source: updated.source,
      lastUsedAt: updated.lastUsedAt ? updated.lastUsedAt.toISOString() : null,
    };
  } catch (error) {
    if (error instanceof ApiKeyAuthError) throw error;
    throw new ApiKeyAuthError(500, "API_KEY_AUTH_ERROR", "API key validation failed.");
  }
}

export function apiKeyAuthErrorResponse(error) {
  const isKnownError = error instanceof ApiKeyAuthError;
  return Response.json(
    {
      ok: false,
      error: {
        code: isKnownError ? error.code : "API_KEY_AUTH_ERROR",
        message: isKnownError ? error.message : "API key validation failed.",
      },
    },
    { status: isKnownError ? error.status : 500 }
  );
}
