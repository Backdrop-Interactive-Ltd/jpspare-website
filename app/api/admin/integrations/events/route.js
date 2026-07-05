import { json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EVENT_STATUSES = new Set(["RECEIVED", "PROCESSING", "SUCCESS", "FAILED", "SKIPPED"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeEvent(event) {
  if (!event) return null;

  return {
    id: event.id,
    direction: event.direction,
    sourceSystem: event.sourceSystem,
    targetSystem: event.targetSystem,
    eventType: event.eventType,
    entityType: event.entityType,
    entityId: event.entityId,
    externalId: event.externalId,
    apiKeyId: event.apiKeyId,
    requestId: event.requestId,
    idempotencyKey: event.idempotencyKey,
    status: event.status,
    attempts: event.attempts,
    errorMessage: event.errorMessage,
    processedAt: event.processedAt?.toISOString?.() ?? event.processedAt,
    createdAt: event.createdAt?.toISOString?.() ?? event.createdAt,
    updatedAt: event.updatedAt?.toISOString?.() ?? event.updatedAt,
  };
}

function buildWhere(searchParams) {
  const status = clean(searchParams.get("status"));
  const sourceSystem = clean(searchParams.get("sourceSystem"));
  const eventType = clean(searchParams.get("eventType"));
  const entityType = clean(searchParams.get("entityType"));

  return {
    ...(status && EVENT_STATUSES.has(status) ? { status } : {}),
    ...(sourceSystem ? { sourceSystem: { contains: sourceSystem, mode: "insensitive" } } : {}),
    ...(eventType ? { eventType: { contains: eventType, mode: "insensitive" } } : {}),
    ...(entityType ? { entityType: { contains: entityType, mode: "insensitive" } } : {}),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [items, total] = await prisma.$transaction([
    prisma.integrationEventLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.integrationEventLog.count({ where }),
  ]);

  const [statusRows, sourceRows] = await Promise.all([
    prisma.integrationEventLog.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    prisma.integrationEventLog.groupBy({
      by: ["sourceSystem"],
      where,
      _count: { _all: true },
      orderBy: { _count: { sourceSystem: "desc" } },
      take: 10,
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const successCount = countsByStatus.SUCCESS || 0;
  const failedCount = countsByStatus.FAILED || 0;
  const processingCount = countsByStatus.PROCESSING || 0;
  const skippedCount = countsByStatus.SKIPPED || 0;
  const receivedCount = countsByStatus.RECEIVED || 0;
  const totalAttempts = successCount + failedCount + processingCount + skippedCount + receivedCount;

  return json({
    items: items.map(serializeEvent),
    analytics: {
      totalEvents: total,
      successCount,
      failedCount,
      processingCount,
      skippedCount,
      receivedCount,
      successRate: totalAttempts ? Math.round((successCount / totalAttempts) * 100) : 0,
      topSourceSystems: sourceRows.map((row) => ({
        sourceSystem: row.sourceSystem || "Not recorded",
        count: row._count._all,
      })),
    },
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}
