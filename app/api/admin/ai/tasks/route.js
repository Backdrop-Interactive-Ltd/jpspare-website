import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TASK_STATUSES = new Set(["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function durationMs(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return end - start;
}

function buildWhere(searchParams) {
  const status = clean(searchParams.get("status")).toUpperCase();
  const agentId = clean(searchParams.get("agent"));
  const priority = clean(searchParams.get("priority"));
  const taskType = clean(searchParams.get("taskType"));
  const search = clean(searchParams.get("search"));

  return {
    ...(status && TASK_STATUSES.has(status) ? { status } : {}),
    ...(agentId ? { agentId } : {}),
    ...(priority ? { priority: { equals: priority, mode: "insensitive" } } : {}),
    ...(taskType ? { taskType: { contains: taskType, mode: "insensitive" } } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { taskType: { contains: search, mode: "insensitive" } },
            { agent: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function serializeTask(task) {
  return {
    id: task.id,
    taskType: task.taskType,
    status: task.status,
    priority: task.priority,
    scheduledFor: serializeDate(task.scheduledFor),
    startedAt: serializeDate(task.startedAt),
    completedAt: serializeDate(task.completedAt),
    createdAt: serializeDate(task.createdAt),
    updatedAt: serializeDate(task.updatedAt),
    durationMs: durationMs(task.startedAt, task.completedAt),
    agent: task.agent
      ? {
          id: task.agent.id,
          name: task.agent.name,
          type: task.agent.type,
          status: task.agent.status,
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

  const [tasks, total, statusRows] = await Promise.all([
    prisma.agentTask.findMany({
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
      },
    }),
    prisma.agentTask.count({ where }),
    prisma.agentTask.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));

  return json({
    analytics: {
      totalTasks: Object.values(countsByStatus).reduce((sum, count) => sum + count, 0),
      pending: countsByStatus.PENDING || 0,
      running: countsByStatus.RUNNING || 0,
      completed: countsByStatus.COMPLETED || 0,
      failed: countsByStatus.FAILED || 0,
      cancelled: countsByStatus.CANCELLED || 0,
    },
    tasks: tasks.map(serializeTask),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
