import { prisma } from "../db";

const MAX_ERROR_LENGTH = 500;

function sanitizeErrorMessage(error) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || error?.reason || "Integration event failed";

  return String(message).replace(/\s+/g, " ").trim().slice(0, MAX_ERROR_LENGTH);
}

function safeJson(value) {
  if (value === undefined) return undefined;
  return value;
}

export async function getIdempotencyRecord(key) {
  try {
    if (!key) return null;

    return await prisma.integrationIdempotencyKey.findUnique({
      where: { key },
    });
  } catch {
    return null;
  }
}

export async function createIdempotencyRecord(payload = {}) {
  try {
    const { key, sourceSystem, endpoint, requestHash, expiresAt } = payload;
    if (!key) return null;

    return await prisma.integrationIdempotencyKey.create({
      data: {
        key,
        sourceSystem,
        endpoint,
        requestHash,
        expiresAt,
        status: "RECEIVED",
      },
    });
  } catch {
    return null;
  }
}

export async function markIdempotencySuccess(key, responseJson) {
  try {
    if (!key) return null;

    return await prisma.integrationIdempotencyKey.update({
      where: { key },
      data: {
        status: "SUCCESS",
        responseJson: safeJson(responseJson),
      },
    });
  } catch {
    return null;
  }
}

export async function markIdempotencyFailed(key, error) {
  try {
    if (!key) return null;

    return await prisma.integrationIdempotencyKey.update({
      where: { key },
      data: {
        status: "FAILED",
        responseJson: {
          errorMessage: sanitizeErrorMessage(error),
        },
      },
    });
  } catch {
    return null;
  }
}

export async function isDuplicateRequest(key, requestHash) {
  if (!key) {
    return { duplicate: false, responseJson: null, status: null };
  }

  const record = await getIdempotencyRecord(key);
  if (!record) {
    return { duplicate: false, responseJson: null, status: null };
  }

  if (record.requestHash && requestHash && record.requestHash !== requestHash) {
    throw new Error("IDEMPOTENCY_KEY_REUSED");
  }

  if (record.status === "SUCCESS" && record.requestHash === requestHash) {
    return {
      duplicate: true,
      responseJson: record.responseJson || null,
      status: record.status,
    };
  }

  return {
    duplicate: false,
    responseJson: record.responseJson || null,
    status: record.status || null,
  };
}
