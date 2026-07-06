import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AGENT_STATUSES = new Set(["ACTIVE", "INACTIVE", "PAUSED"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function buildWhere(searchParams) {
  const status = clean(searchParams.get("status")).toUpperCase();
  const type = clean(searchParams.get("type"));
  const active = clean(searchParams.get("active")).toLowerCase();
  const search = clean(searchParams.get("search"));

  return {
    ...(status && AGENT_STATUSES.has(status) ? { status } : {}),
    ...(type ? { type: { contains: type, mode: "insensitive" } } : {}),
    ...(active === "true" ? { isActive: true } : {}),
    ...(active === "false" ? { isActive: false } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

function serializeAgent(agent) {
  const latestTask = agent.tasks?.[0] || null;
  const latestLog = agent.logs?.[0] || null;

  return {
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    type: agent.type,
    status: agent.status,
    isActive: agent.isActive,
    taskCount: agent._count?.tasks || 0,
    latestTask: latestTask
      ? {
          id: latestTask.id,
          taskType: latestTask.taskType,
          status: latestTask.status,
          priority: latestTask.priority,
          createdAt: serializeDate(latestTask.createdAt),
          updatedAt: serializeDate(latestTask.updatedAt),
        }
      : null,
    latestLog: latestLog
      ? {
          id: latestLog.id,
          level: latestLog.level,
          message: latestLog.message,
          createdAt: serializeDate(latestLog.createdAt),
        }
      : null,
    createdAt: serializeDate(agent.createdAt),
    updatedAt: serializeDate(agent.updatedAt),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const where = buildWhere(searchParams);

  const [agents, total, active, paused, inactive] = await Promise.all([
    prisma.agent.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
      include: {
        tasks: {
          orderBy: [{ updatedAt: "desc" }],
          take: 1,
        },
        logs: {
          orderBy: [{ createdAt: "desc" }],
          take: 1,
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    }),
    prisma.agent.count(),
    prisma.agent.count({ where: { status: "ACTIVE", isActive: true } }),
    prisma.agent.count({ where: { status: "PAUSED" } }),
    prisma.agent.count({ where: { OR: [{ status: "INACTIVE" }, { isActive: false }] } }),
  ]);

  return json({
    analytics: {
      total,
      active,
      paused,
      inactive,
    },
    agents: agents.map(serializeAgent),
  });
}
