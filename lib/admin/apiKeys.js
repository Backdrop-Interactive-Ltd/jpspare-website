import crypto from "crypto";

export const API_KEY_READ_ROLES = ["SUPER_ADMIN", "ADMIN"];
export const API_KEY_WRITE_ROLES = ["SUPER_ADMIN"];

export function generateRawApiKey() {
  const publicPart = crypto.randomBytes(6).toString("base64url");
  const secretPart = crypto.randomBytes(32).toString("base64url");
  return `jps_${publicPart}_${secretPart}`;
}

export function hashApiKey(rawKey) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function getApiKeyPrefix(rawKey) {
  return rawKey.slice(0, 16);
}

export function maskApiKey(prefix) {
  if (!prefix) return "jps_••••••••••••";
  return `${prefix}${"•".repeat(16)}`;
}

export function normalizeApiKeyPayload(payload = {}) {
  return {
    name: String(payload.name || "BMS Integration").trim() || "BMS Integration",
    allowedIps: String(payload.allowedIps || "").trim() || null,
    webhookUrl: String(payload.webhookUrl || "").trim() || null,
  };
}

export function serializeApiKey(apiKey) {
  return {
    id: apiKey.id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    maskedKey: maskApiKey(apiKey.keyPrefix),
    status: apiKey.status,
    allowedIps: apiKey.allowedIps,
    webhookUrl: apiKey.webhookUrl,
    lastUsedAt: apiKey.lastUsedAt ? apiKey.lastUsedAt.toISOString() : null,
    revokedAt: apiKey.revokedAt ? apiKey.revokedAt.toISOString() : null,
    createdAt: apiKey.createdAt ? apiKey.createdAt.toISOString() : null,
    updatedAt: apiKey.updatedAt ? apiKey.updatedAt.toISOString() : null,
    createdBy: apiKey.createdBy
      ? {
          id: apiKey.createdBy.id,
          name: apiKey.createdBy.name,
          email: apiKey.createdBy.email,
        }
      : null,
  };
}

export function apiKeyInclude() {
  return {
    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  };
}
