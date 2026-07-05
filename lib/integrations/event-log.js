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

export async function createIntegrationEvent(payload = {}) {
  try {
    const {
      direction,
      sourceSystem,
      targetSystem,
      eventType,
      entityType,
      entityId,
      externalId,
      apiKeyId,
      requestId,
      idempotencyKey,
      payloadJson,
    } = payload;

    return await prisma.integrationEventLog.create({
      data: {
        direction,
        sourceSystem,
        targetSystem,
        eventType,
        entityType,
        entityId,
        externalId,
        apiKeyId,
        requestId,
        idempotencyKey,
        payloadJson: safeJson(payloadJson),
        status: "RECEIVED",
        attempts: 0,
      },
    });
  } catch {
    return null;
  }
}

export async function markIntegrationProcessing(eventId) {
  try {
    if (!eventId) return null;

    return await prisma.integrationEventLog.update({
      where: { id: eventId },
      data: {
        status: "PROCESSING",
        attempts: { increment: 1 },
      },
    });
  } catch {
    return null;
  }
}

export async function markIntegrationSuccess(eventId, responseJson) {
  try {
    if (!eventId) return null;

    return await prisma.integrationEventLog.update({
      where: { id: eventId },
      data: {
        status: "SUCCESS",
        responseJson: safeJson(responseJson),
        processedAt: new Date(),
      },
    });
  } catch {
    return null;
  }
}

export async function markIntegrationFailed(eventId, error) {
  try {
    if (!eventId) return null;

    return await prisma.integrationEventLog.update({
      where: { id: eventId },
      data: {
        status: "FAILED",
        errorMessage: sanitizeErrorMessage(error),
        processedAt: new Date(),
      },
    });
  } catch {
    return null;
  }
}

export async function markIntegrationSkipped(eventId, reason) {
  try {
    if (!eventId) return null;

    return await prisma.integrationEventLog.update({
      where: { id: eventId },
      data: {
        status: "SKIPPED",
        errorMessage: sanitizeErrorMessage(reason || "Integration event skipped"),
        processedAt: new Date(),
      },
    });
  } catch {
    return null;
  }
}
