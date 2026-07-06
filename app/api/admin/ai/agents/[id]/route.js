import { CATALOG_READ_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { apiError, json, prisma, requireAdminApi } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function agentId(context) {
  return (await context.params).id;
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function safeJson(value) {
  return value === undefined ? null : value;
}

function serializeAgent(agent) {
  return {
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    type: agent.type,
    status: agent.status,
    isActive: agent.isActive,
    description: agent.description,
    configJson: safeJson(agent.configJson),
    permissionsJson: safeJson(agent.permissionsJson),
    createdAt: serializeDate(agent.createdAt),
    updatedAt: serializeDate(agent.updatedAt),
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
  };
}

function serializeAction(action) {
  return {
    id: action.id,
    actionType: action.actionType,
    entityType: action.entityType,
    entityId: action.entityId,
    status: action.status,
    executedAt: serializeDate(action.executedAt),
    createdAt: serializeDate(action.createdAt),
    updatedAt: serializeDate(action.updatedAt),
    task: action.task
      ? {
          id: action.task.id,
          taskType: action.task.taskType,
          status: action.task.status,
        }
      : null,
  };
}

function serializeLog(log) {
  return {
    id: log.id,
    level: log.level,
    message: log.message,
    metadataJson: safeJson(log.metadataJson),
    createdAt: serializeDate(log.createdAt),
    task: log.task
      ? {
          id: log.task.id,
          taskType: log.task.taskType,
          status: log.task.status,
        }
      : null,
  };
}

function serializeMemory(memory) {
  return {
    id: memory.id,
    scope: memory.scope,
    entityType: memory.entityType,
    entityId: memory.entityId,
    memoryJson: safeJson(memory.memoryJson),
    expiresAt: serializeDate(memory.expiresAt),
    createdAt: serializeDate(memory.createdAt),
    updatedAt: serializeDate(memory.updatedAt),
  };
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const id = await agentId(context);
  const agent = await prisma.agent.findUnique({
    where: { id },
  });

  if (!agent) return apiError("Agent not found.", 404);

  const [statusRows, recentTasks, recentActions, recentLogs, memory] = await Promise.all([
    prisma.agentTask.groupBy({
      by: ["status"],
      where: { agentId: id },
      _count: { _all: true },
    }),
    prisma.agentTask.findMany({
      where: { agentId: id },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    }),
    prisma.agentAction.findMany({
      where: {
        task: {
          agentId: id,
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      include: {
        task: {
          select: {
            id: true,
            taskType: true,
            status: true,
          },
        },
      },
    }),
    prisma.agentLog.findMany({
      where: { agentId: id },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      include: {
        task: {
          select: {
            id: true,
            taskType: true,
            status: true,
          },
        },
      },
    }),
    prisma.agentMemory.findMany({
      where: { agentId: id },
      orderBy: [{ updatedAt: "desc" }],
      take: 20,
    }),
  ]);

  const taskCounts = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

  return json({
    agent: serializeAgent(agent),
    taskSummary: {
      totalTasks,
      pending: taskCounts.PENDING || 0,
      running: taskCounts.RUNNING || 0,
      completed: taskCounts.COMPLETED || 0,
      failed: taskCounts.FAILED || 0,
    },
    recentTasks: recentTasks.map(serializeTask),
    recentActions: recentActions.map(serializeAction),
    recentLogs: recentLogs.map(serializeLog),
    memory: memory.map(serializeMemory),
  });
}
