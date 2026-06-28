import { decryptSecretJson, encryptSecretJson, maskSecretJson } from "../security/secret-encryption";

export const OTP_PROVIDER_READ_ROLES = ["SUPER_ADMIN", "ADMIN"];
export const OTP_PROVIDER_WRITE_ROLES = ["SUPER_ADMIN"];

const CHANNELS = new Set(["PHONE", "EMAIL"]);
const PROVIDER_TYPES = new Set(["GENERIC_HTTP", "SMTP", "CUSTOM_API"]);
const METHODS = new Set(["GET", "POST", "PUT", "PATCH"]);
const DEFAULT_TIMEOUT_MS = 10000;

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cleanOptionalString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function normalizeBoolean(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return Boolean(value);
}

function normalizeTimeoutMs(value) {
  if (value === undefined || value === null || value === "") return DEFAULT_TIMEOUT_MS;
  const timeoutMs = Number(value);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60000) return null;
  return timeoutMs;
}

function getMaskedSecretJson(provider) {
  if (!provider.secretJsonEncrypted) return null;

  try {
    return maskSecretJson(decryptSecretJson(provider.secretJsonEncrypted));
  } catch {
    return null;
  }
}

export function serializeOtpProvider(provider) {
  return {
    id: provider.id,
    name: provider.name,
    channel: provider.channel,
    providerType: provider.providerType,
    isActive: provider.isActive,
    isDefault: provider.isDefault,
    baseUrl: provider.baseUrl,
    method: provider.method,
    fromEmail: provider.fromEmail,
    fromName: provider.fromName,
    senderId: provider.senderId,
    configJson: provider.configJson,
    hasSecret: Boolean(provider.secretJsonEncrypted),
    maskedSecretJson: getMaskedSecretJson(provider),
    timeoutMs: provider.timeoutMs,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
  };
}

export function normalizeOtpProviderPayload(body, existing = null) {
  const payload = body && typeof body === "object" ? body : {};
  const data = {};

  if (payload.name !== undefined || !existing) {
    const name = cleanOptionalString(payload.name);
    if (!name) return { error: "Provider name is required." };
    data.name = name;
  }

  if (payload.channel !== undefined || !existing) {
    const channel = cleanOptionalString(payload.channel)?.toUpperCase();
    if (!CHANNELS.has(channel)) return { error: "Channel must be PHONE or EMAIL." };
    data.channel = channel;
  }

  if (payload.providerType !== undefined || !existing) {
    const providerType = cleanOptionalString(payload.providerType)?.toUpperCase();
    if (!PROVIDER_TYPES.has(providerType)) return { error: "Provider type is invalid." };
    data.providerType = providerType;
  }

  if (payload.isActive !== undefined || !existing) {
    data.isActive = normalizeBoolean(payload.isActive, true);
  }

  if (payload.isDefault !== undefined || !existing) {
    data.isDefault = normalizeBoolean(payload.isDefault, false);
  }

  for (const field of ["baseUrl", "fromEmail", "fromName", "senderId"]) {
    if (payload[field] !== undefined) {
      data[field] = cleanOptionalString(payload[field]);
    }
  }

  if (payload.method !== undefined) {
    const method = cleanOptionalString(payload.method)?.toUpperCase() || null;
    if (method && !METHODS.has(method)) return { error: "HTTP method is invalid." };
    data.method = method;
  } else if (!existing && data.providerType === "GENERIC_HTTP") {
    data.method = "POST";
  }

  if (payload.configJson !== undefined) {
    if (payload.configJson !== null && !isPlainObject(payload.configJson)) {
      return { error: "configJson must be an object." };
    }
    data.configJson = payload.configJson;
  }

  if (payload.timeoutMs !== undefined || !existing) {
    const timeoutMs = normalizeTimeoutMs(payload.timeoutMs);
    if (!timeoutMs) return { error: "timeoutMs must be between 1000 and 60000." };
    data.timeoutMs = timeoutMs;
  }

  if (payload.secretJson !== undefined) {
    if (payload.secretJson === null) {
      data.secretJsonEncrypted = null;
    } else if (!isPlainObject(payload.secretJson)) {
      return { error: "secretJson must be an object." };
    } else {
      try {
        data.secretJsonEncrypted = encryptSecretJson(payload.secretJson);
      } catch {
        return { secretError: true };
      }
    }
  }

  const finalProvider = {
    ...(existing || {}),
    ...data,
  };

  if (finalProvider.providerType === "GENERIC_HTTP" && !finalProvider.baseUrl) {
    return { error: "baseUrl is required for GENERIC_HTTP providers." };
  }

  if (finalProvider.providerType === "SMTP") {
    const configJson = finalProvider.configJson;
    if (!isPlainObject(configJson) || !configJson.host || configJson.port === undefined || configJson.port === null || configJson.port === "") {
      return { error: "SMTP providers require configJson.host and configJson.port." };
    }
  }

  return { data, isDefault: data.isDefault === true, channel: finalProvider.channel };
}
