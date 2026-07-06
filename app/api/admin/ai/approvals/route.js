import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APPROVAL_STATUSES = new Set(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function buildWhere(searchParams) {
  const status = clean(searchParams.get("status")).toUpperCase();
  const agentId = clean(searchParams.get("agent"));
  const requestedById = clean(searchParams.get("requestedBy"));
  const approvedById = clean(searchParams.get("approvedBy"));
  const search = clean(searchParams.get("search"));

  return {
    ...(status && APPROVAL_STATUSES.has(status) ? { status } : {}),
    ...(requestedById ? { requestedById } : {}),
    ...(approvedById ? { approvedById } : {}),
    ...(agentId ? { action: { task: { agentId } } } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { action: { actionType: { contains: search, mode: "insensitive" } } },
            { action: { entityType: { contains: search, mode: "insensitive" } } },
            { action: { entityId: { contains: search, mode: "insensitive" } } },
            { action: { task: { agent: { name: { contains: search, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };
}

function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function serializeApproval(approval) {
  const action = approval.action || null;
  const agent = action?.task?.agent || null;

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
    action: action
      ? {
          id: action.id,
          actionType: action.actionType,
          entityType: action.entityType,
          entityId: action.entityId,
          status: action.status,
        }
      : null,
    agent: agent
      ? {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
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

  const [approvals, total, statusRows] = await Promise.all([
    prisma.agentApproval.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
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
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.agentApproval.count({ where }),
    prisma.agentApproval.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));

  return json({
    analytics: {
      totalApprovals: Object.values(countsByStatus).reduce((sum, count) => sum + count, 0),
      pending: countsByStatus.PENDING || 0,
      approved: countsByStatus.APPROVED || 0,
      rejected: countsByStatus.REJECTED || 0,
      cancelled: countsByStatus.CANCELLED || 0,
    },
    approvals: approvals.map(serializeApproval),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
