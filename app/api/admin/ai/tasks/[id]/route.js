import { CATALOG_READ_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { apiError, json, prisma, requireAdminApi } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function taskId(context) {
  return (await context.params).id;
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function safeJson(value) {
  return value === undefined ? null : value;
}

function serializeTask(task) {
  return {
    id: task.id,
    taskType: task.taskType,
    status: task.status,
    priority: task.priority,
    inputJson: safeJson(task.inputJson),
    outputJson: safeJson(task.outputJson),
    errorMessage: task.errorMessage,
    scheduledFor: serializeDate(task.scheduledFor),
    startedAt: serializeDate(task.startedAt),
    completedAt: serializeDate(task.completedAt),
    createdAt: serializeDate(task.createdAt),
    updatedAt: serializeDate(task.updatedAt),
    agent: task.agent
      ? {
          id: task.agent.id,
          name: task.agent.name,
          slug: task.agent.slug,
          type: task.agent.type,
          status: task.agent.status,
        }
      : null,
  };
}

function serializeAction(action) {
  return {
    id: action.id,
    actionType: action.actionType,
    entityType: action.entityType,
    entityId: action.entityId,
    proposedChangeJson: safeJson(action.proposedChangeJson),
    status: action.status,
    executedAt: serializeDate(action.executedAt),
    createdAt: serializeDate(action.createdAt),
    updatedAt: serializeDate(action.updatedAt),
  };
}

function serializeLog(log) {
  return {
    id: log.id,
    level: log.level,
    message: log.message,
    metadataJson: safeJson(log.metadataJson),
    createdAt: serializeDate(log.createdAt),
  };
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const task = await prisma.agentTask.findUnique({
    where: { id: await taskId(context) },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          status: true,
        },
      },
      actions: {
        orderBy: [{ createdAt: "desc" }],
        take: 20,
      },
      logs: {
        orderBy: [{ createdAt: "desc" }],
        take: 20,
      },
    },
  });

  if (!task) return apiError("Task not found.", 404);

  return json({
    task: serializeTask(task),
    actions: task.actions.map(serializeAction),
    logs: task.logs.map(serializeLog),
  });
}
