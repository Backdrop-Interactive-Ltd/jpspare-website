import { prisma } from "../db";

const VALID_PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function normalizePriority(value) {
  const priority = cleanString(value, "MEDIUM").toUpperCase();
  return VALID_PRIORITIES.has(priority) ? priority : "MEDIUM";
}

function normalizeJson(value) {
  if (value === undefined) return null;
  return value;
}

function normalizeDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sanitizeError(error) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || error?.code || "Unknown agent task error";

  return cleanString(message, "Unknown agent task error").slice(0, 500);
}

export async function createAgentTask(payload = {}) {
  try {
    const agentId = cleanString(payload.agentId);
    const taskType = cleanString(payload.taskType);

    if (!agentId || !taskType) return null;

    return await prisma.agentTask.create({
      data: {
        agentId,
        taskType,
        priority: normalizePriority(payload.priority),
        status: "PENDING",
        inputJson: normalizeJson(payload.inputJson),
        scheduledFor: normalizeDate(payload.scheduledFor),
      },
    });
  } catch {
    return null;
  }
}

export async function markTaskRunning(taskId) {
  try {
    const id = cleanString(taskId);
    if (!id) return null;

    return await prisma.agentTask.update({
      where: { id },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });
  } catch {
    return null;
  }
}

export async function markTaskCompleted(taskId, outputJson) {
  try {
    const id = cleanString(taskId);
    if (!id) return null;

    return await prisma.agentTask.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        outputJson: normalizeJson(outputJson),
        errorMessage: null,
      },
    });
  } catch {
    return null;
  }
}

export async function markTaskFailed(taskId, error) {
  try {
    const id = cleanString(taskId);
    if (!id) return null;

    return await prisma.agentTask.update({
      where: { id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: sanitizeError(error),
      },
    });
  } catch {
    return null;
  }
}

export async function cancelTask(taskId) {
  try {
    const id = cleanString(taskId);
    if (!id) return null;

    return await prisma.agentTask.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });
  } catch {
    return null;
  }
}
