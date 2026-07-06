import { CATALOG_READ_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { apiError, json, prisma, requireAdminApi } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function approvalId(context) {
  return (await context.params).id;
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function safeJson(value) {
  return value === undefined ? null : value;
}

function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function serializeAction(action) {
  if (!action) return null;
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

function serializeTask(task) {
  if (!task) return null;
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

function serializeApproval(approval) {
  return {
    id: approval.id,
    status: approval.status,
    notes: approval.notes,
    approvedAt: serializeDate(approval.approvedAt),
    rejectedAt: serializeDate(approval.rejectedAt),
    createdAt: serializeDate(approval.createdAt),
    updatedAt: serializeDate(approval.updatedAt),
    requestedBy: serializeUser(approval.requestedBy),
    approvedBy: serializeUser(approval.approvedBy),
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

  const approval = await prisma.agentApproval.findUnique({
    where: { id: await approvalId(context) },
    include: {
      requestedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      action: {
        include: {
          task: {
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
              logs: {
                orderBy: [{ createdAt: "desc" }],
                take: 20,
              },
            },
          },
        },
      },
    },
  });

  if (!approval) return apiError("Approval not found.", 404);

  return json({
    approval: serializeApproval(approval),
    action: serializeAction(approval.action),
    task: serializeTask(approval.action?.task),
    logs: (approval.action?.task?.logs || []).map(serializeLog),
  });
}
