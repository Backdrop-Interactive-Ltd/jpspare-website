import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RETURN_STATUSES = new Set(["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "INSPECTING", "COMPLETED", "CANCELLED"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function buildWhere(searchParams) {
  const status = clean(searchParams.get("status")).toUpperCase();
  const customer = clean(searchParams.get("customer"));
  const orderNumber = clean(searchParams.get("orderNumber"));
  const returnNumber = clean(searchParams.get("returnNumber"));

  return {
    ...(status && RETURN_STATUSES.has(status) ? { status } : {}),
    ...(returnNumber ? { returnNumber: { contains: returnNumber, mode: "insensitive" } } : {}),
    ...(orderNumber ? { order: { orderNumber: { contains: orderNumber, mode: "insensitive" } } } : {}),
    ...(customer
      ? {
          OR: [
            { customer: { firstName: { contains: customer, mode: "insensitive" } } },
            { customer: { lastName: { contains: customer, mode: "insensitive" } } },
            { customer: { email: { contains: customer, mode: "insensitive" } } },
            { customer: { phone: { contains: customer, mode: "insensitive" } } },
            { order: { customerName: { contains: customer, mode: "insensitive" } } },
            { order: { customerEmail: { contains: customer, mode: "insensitive" } } },
            { order: { customerPhone: { contains: customer, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function customerName(customer, order) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || order?.customerName || "Unknown customer";
}

function serializeReturn(item) {
  return {
    id: item.id,
    returnNumber: item.returnNumber,
    status: item.status,
    reason: item.reason,
    requestedAt: serializeDate(item.requestedAt),
    completedAt: serializeDate(item.completedAt),
    createdAt: serializeDate(item.createdAt),
    updatedAt: serializeDate(item.updatedAt),
    order: item.order
      ? {
          id: item.order.id,
          orderNumber: item.order.orderNumber,
          status: item.order.status,
          customerName: item.order.customerName,
        }
      : null,
    customer: item.customer
      ? {
          id: item.customer.id,
          name: customerName(item.customer, item.order),
          email: item.customer.email || item.order?.customerEmail || null,
          phone: item.customer.phone || item.order?.customerPhone || null,
        }
      : null,
    itemCount: item._count?.items || 0,
    refundStatus: item.refundCase?.refundStatus || null,
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [returns, total, statusRows] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      orderBy: [{ requestedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        refundCase: {
          select: {
            refundStatus: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.returnRequest.count({ where }),
    prisma.returnRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));

  return json({
    analytics: {
      totalReturns: Object.values(countsByStatus).reduce((sum, count) => sum + count, 0),
      requested: countsByStatus.REQUESTED || 0,
      approved: countsByStatus.APPROVED || 0,
      rejected: countsByStatus.REJECTED || 0,
      inspecting: countsByStatus.INSPECTING || 0,
      completed: countsByStatus.COMPLETED || 0,
      cancelled: countsByStatus.CANCELLED || 0,
    },
    returns: returns.map(serializeReturn),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
