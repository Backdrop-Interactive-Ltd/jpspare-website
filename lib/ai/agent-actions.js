import { prisma } from "../db";

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function normalizeJson(value) {
  if (value === undefined) return null;
  return value;
}

export async function createProposedAction(payload = {}) {
  try {
    const taskId = cleanString(payload.taskId);
    const actionType = cleanString(payload.actionType);

    if (!taskId || !actionType) return null;

    return await prisma.agentAction.create({
      data: {
        taskId,
        actionType,
        entityType: cleanString(payload.entityType) || null,
        entityId: cleanString(payload.entityId) || null,
        proposedChangeJson: normalizeJson(payload.proposedChangeJson),
        status: "PROPOSED",
      },
    });
  } catch {
    return null;
  }
}

export async function markActionApproved(actionId) {
  try {
    const id = cleanString(actionId);
    if (!id) return null;

    return await prisma.agentAction.update({
      where: { id },
      data: { status: "APPROVED" },
    });
  } catch {
    return null;
  }
}

export async function markActionRejected(actionId) {
  try {
    const id = cleanString(actionId);
    if (!id) return null;

    return await prisma.agentAction.update({
      where: { id },
      data: { status: "REJECTED" },
    });
  } catch {
    return null;
  }
}

export async function markActionExecuted(actionId) {
  try {
    const id = cleanString(actionId);
    if (!id) return null;

    return await prisma.agentAction.update({
      where: { id },
      data: {
        status: "EXECUTED",
        executedAt: new Date(),
      },
    });
  } catch {
    return null;
  }
}

export async function markActionFailed(actionId) {
  try {
    const id = cleanString(actionId);
    if (!id) return null;

    return await prisma.agentAction.update({
      where: { id },
      data: {
        status: "FAILED",
        executedAt: new Date(),
      },
    });
  } catch {
    return null;
  }
}
