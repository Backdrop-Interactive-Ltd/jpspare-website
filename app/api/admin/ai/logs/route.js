import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LOG_LEVELS = new Set(["INFO", "WARNING", "ERROR"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function parseDate(value) {
  const cleanValue = clean(value);
  if (!cleanValue) return null;
  const date = new Date(cleanValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

function metadataPreview(metadataJson) {
  if (metadataJson === null || metadataJson === undefined) return null;
  try {
    return JSON.stringify(metadataJson).slice(0, 240);
  } catch {
    return "Unserializable metadata";
  }
}

function buildWhere(searchParams) {
  const level = clean(searchParams.get("level")).toUpperCase();
  const agentId = clean(searchParams.get("agent"));
  const taskId = clean(searchParams.get("task"));
  const dateFrom = parseDate(searchParams.get("dateFrom"));
  const dateTo = parseDate(searchParams.get("dateTo"));
  const search = clean(searchParams.get("search"));

  return {
    ...(level && LOG_LEVELS.has(level) ? { level } : {}),
    ...(agentId ? { agentId } : {}),
    ...(taskId ? { taskId } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { message: { contains: search, mode: "insensitive" } },
            { taskId: { contains: search, mode: "insensitive" } },
            { agent: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function serializeLog(log) {
  return {
    id: log.id,
    level: log.level,
    message: log.message,
    metadataPreview: metadataPreview(log.metadataJson),
    createdAt: serializeDate(log.createdAt),
    agent: log.agent
      ? {
          id: log.agent.id,
          name: log.agent.name,
          type: log.agent.type,
          status: log.agent.status,
        }
      : null,
    task: log.task
      ? {
          id: log.task.id,
          taskType: log.task.taskType,
          status: log.task.status,
        }
      : null,
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [logs, total, levelRows, logsToday] = await Promise.all([
    prisma.agentLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
        task: {
          select: {
            id: true,
            taskType: true,
            status: true,
          },
        },
      },
    }),
    prisma.agentLog.count({ where }),
    prisma.agentLog.groupBy({
      by: ["level"],
      _count: { _all: true },
    }),
    prisma.agentLog.count({ where: { createdAt: { gte: todayStart } } }),
  ]);

  const countsByLevel = Object.fromEntries(levelRows.map((row) => [row.level, row._count._all]));

  return json({
    analytics: {
      totalLogs: Object.values(countsByLevel).reduce((sum, count) => sum + count, 0),
      infoLogs: countsByLevel.INFO || 0,
      warningLogs: countsByLevel.WARNING || 0,
      errorLogs: countsByLevel.ERROR || 0,
      logsToday,
    },
    logs: logs.map(serializeLog),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
