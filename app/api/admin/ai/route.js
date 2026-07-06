import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function percentage(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function serializeAgent(agent) {
  const lastTask = agent.tasks?.[0] || null;
  const lastLog = agent.logs?.[0] || null;
  const lastActivity = [lastTask?.updatedAt, lastLog?.createdAt, agent.updatedAt]
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    type: agent.type,
    status: agent.status,
    isActive: agent.isActive,
    lastTask: lastTask
      ? {
          id: lastTask.id,
          taskType: lastTask.taskType,
          status: lastTask.status,
          updatedAt: serializeDate(lastTask.updatedAt),
        }
      : null,
    lastActivity: serializeDate(lastActivity),
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

function serializeApproval(approval) {
  return {
    id: approval.id,
    status: approval.status,
    notes: approval.notes,
    approvedAt: serializeDate(approval.approvedAt),
    rejectedAt: serializeDate(approval.rejectedAt),
    createdAt: serializeDate(approval.createdAt),
    updatedAt: serializeDate(approval.updatedAt),
    action: approval.action
      ? {
          id: approval.action.id,
          actionType: approval.action.actionType,
          status: approval.action.status,
          entityType: approval.action.entityType,
          entityId: approval.action.entityId,
          agent: approval.action.task?.agent
            ? {
                id: approval.action.task.agent.id,
                name: approval.action.task.agent.name,
                type: approval.action.task.agent.type,
              }
            : null,
        }
      : null,
    requestedBy: approval.requestedBy
      ? {
          id: approval.requestedBy.id,
          name: approval.requestedBy.name,
          email: approval.requestedBy.email,
        }
      : null,
    approvedBy: approval.approvedBy
      ? {
          id: approval.approvedBy.id,
          name: approval.approvedBy.name,
          email: approval.approvedBy.email,
        }
      : null,
  };
}

function serializeLog(log) {
  return {
    id: log.id,
    level: log.level,
    message: log.message,
    createdAt: serializeDate(log.createdAt),
    agent: log.agent
      ? {
          id: log.agent.id,
          name: log.agent.name,
          type: log.agent.type,
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

export async function GET() {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalAgents,
    activeAgents,
    inactiveAgents,
    taskStatusRows,
    pendingApprovals,
    tasksCompletedToday,
    approvalStatusRows,
    agentStatusRows,
    agents,
    recentTasks,
    recentApprovals,
    recentLogs,
    mostActiveAgents,
  ] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { status: "ACTIVE", isActive: true } }),
    prisma.agent.count({ where: { OR: [{ status: "INACTIVE" }, { isActive: false }] } }),
    prisma.agentTask.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.agentApproval.count({ where: { status: "PENDING" } }),
    prisma.agentTask.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: todayStart },
      },
    }),
    prisma.agentApproval.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.agent.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.agent.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 10,
      include: {
        tasks: {
          orderBy: [{ updatedAt: "desc" }],
          take: 1,
        },
        logs: {
          orderBy: [{ createdAt: "desc" }],
          take: 1,
        },
      },
    }),
    prisma.agentTask.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 10,
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
    prisma.agentApproval.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 10,
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
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.agentLog.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
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
    prisma.agentTask.groupBy({
      by: ["agentId"],
      _count: { _all: true },
      orderBy: {
        _count: {
          agentId: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const taskCounts = Object.fromEntries(taskStatusRows.map((row) => [row.status, row._count._all]));
  const approvalCounts = Object.fromEntries(approvalStatusRows.map((row) => [row.status, row._count._all]));
  const agentCounts = Object.fromEntries(agentStatusRows.map((row) => [row.status, row._count._all]));
  const approvalTotal = Object.values(approvalCounts).reduce((sum, count) => sum + count, 0);
  const approvedApprovals = approvalCounts.APPROVED || 0;
  const activeAgentIds = mostActiveAgents.map((row) => row.agentId).filter(Boolean);
  const activeAgentRecords = activeAgentIds.length
    ? await prisma.agent.findMany({
        where: { id: { in: activeAgentIds } },
        select: {
          id: true,
          name: true,
          type: true,
        },
      })
    : [];
  const activeAgentById = new Map(activeAgentRecords.map((agent) => [agent.id, agent]));

  return json({
    overview: {
      totalAgents,
      activeAgents,
      inactiveAgents,
      pendingTasks: taskCounts.PENDING || 0,
      runningTasks: taskCounts.RUNNING || 0,
      completedTasks: taskCounts.COMPLETED || 0,
      failedTasks: taskCounts.FAILED || 0,
      pendingApprovals,
    },
    analytics: {
      tasksCompletedToday,
      approvalRate: percentage(approvedApprovals, approvalTotal),
      agentStatusDistribution: agentCounts,
      taskStatusDistribution: taskCounts,
      mostActiveAgents: mostActiveAgents.map((row) => ({
        agentId: row.agentId,
        name: activeAgentById.get(row.agentId)?.name || "Unknown agent",
        type: activeAgentById.get(row.agentId)?.type || null,
        taskCount: row._count._all,
      })),
    },
    agents: agents.map(serializeAgent),
    recentTasks: recentTasks.map(serializeTask),
    recentApprovals: recentApprovals.map(serializeApproval),
    recentLogs: recentLogs.map(serializeLog),
  });
}
