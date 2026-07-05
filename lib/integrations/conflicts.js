import { prisma } from "../db";

function normalizeComparable(value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(normalizeComparable);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparable(value[key]);
        return result;
      }, {});
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(normalizeComparable(value));
}

function safeJson(value) {
  if (value === undefined) return undefined;
  return value;
}

export async function createIntegrationConflict(payload = {}) {
  try {
    const {
      entityType,
      entityId,
      externalId,
      conflictType,
      fieldPath,
      localValueJson,
      incomingValueJson,
    } = payload;

    return await prisma.integrationConflict.create({
      data: {
        entityType,
        entityId,
        externalId,
        conflictType,
        fieldPath,
        localValueJson: safeJson(localValueJson),
        incomingValueJson: safeJson(incomingValueJson),
        status: "OPEN",
      },
    });
  } catch {
    return null;
  }
}

export async function findOpenConflicts(filters = {}) {
  try {
    const { entityType, entityId, externalId } = filters;

    return await prisma.integrationConflict.findMany({
      where: {
        status: "OPEN",
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
        ...(externalId ? { externalId } : {}),
      },
      orderBy: [{ createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

export function detectFieldConflict(localValue, incomingValue) {
  const normalizedLocal = normalizeComparable(localValue);
  const normalizedIncoming = normalizeComparable(incomingValue);

  return {
    conflict: stableStringify(normalizedLocal) !== stableStringify(normalizedIncoming),
    localValue,
    incomingValue,
  };
}

export async function markConflictIgnored(conflictId) {
  try {
    if (!conflictId) return null;

    return await prisma.integrationConflict.update({
      where: { id: conflictId },
      data: { status: "IGNORED" },
    });
  } catch {
    return null;
  }
}

export async function markConflictResolved(conflictId, resolutionJson, resolvedById) {
  try {
    if (!conflictId) return null;

    return await prisma.integrationConflict.update({
      where: { id: conflictId },
      data: {
        status: "RESOLVED",
        resolutionJson: safeJson(resolutionJson),
        resolvedById,
        resolvedAt: new Date(),
      },
    });
  } catch {
    return null;
  }
}
