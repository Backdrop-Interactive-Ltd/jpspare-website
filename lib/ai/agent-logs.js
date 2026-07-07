import { prisma } from "../db";

const VALID_LEVELS = new Set(["INFO", "WARNING", "ERROR"]);
const MAX_MESSAGE_LENGTH = 500;

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function normalizeLevel(value) {
  const level = cleanString(value, "INFO").toUpperCase();
  return VALID_LEVELS.has(level) ? level : "INFO";
}

function normalizeJson(value) {
  if (value === undefined) return null;
  return value;
}

function sanitizeMessage(value, fallback = "") {
  const message =
    typeof value === "string"
      ? value
      : value?.message || value?.code || fallback;

  return cleanString(message, fallback).slice(0, MAX_MESSAGE_LENGTH);
}

export async function createAgentLog(payload = {}) {
  try {
    const agentId = cleanString(payload.agentId);
    const message = sanitizeMessage(payload.message);

    if (!agentId || !message) return null;

    return await prisma.agentLog.create({
      data: {
        agentId,
        taskId: cleanString(payload.taskId) || null,
        level: normalizeLevel(payload.level),
        message,
        metadataJson: normalizeJson(payload.metadataJson),
      },
    });
  } catch {
    return null;
  }
}

export function logAgentInfo(payload = {}) {
  return createAgentLog({
    ...payload,
    level: "INFO",
  });
}

export function logAgentWarning(payload = {}) {
  return createAgentLog({
    ...payload,
    level: "WARNING",
  });
}

export function logAgentError(payload = {}) {
  return createAgentLog({
    ...payload,
    level: "ERROR",
    message: sanitizeMessage(payload.error || payload.message, "Unknown agent error"),
  });
}
