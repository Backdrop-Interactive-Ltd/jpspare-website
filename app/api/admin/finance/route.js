import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SETTLEMENT_STATUSES = new Set(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]);
const PAYMENT_METHODS = new Set(["CASH_ON_DELIVERY", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD", "STRIPE", "BANK_TRANSFER"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function serializeDecimal(value) {
  return value?.toString?.() ?? value ?? "0";
}

function buildSettlementWhere(searchParams) {
  const status = clean(searchParams.get("status")).toUpperCase();
  const gateway = clean(searchParams.get("gateway"));
  const paymentMethod = clean(searchParams.get("paymentMethod")).toUpperCase();
  const settlementNumber = clean(searchParams.get("settlementNumber"));

  return {
    ...(status && SETTLEMENT_STATUSES.has(status) ? { status } : {}),
    ...(gateway ? { gateway: { contains: gateway, mode: "insensitive" } } : {}),
    ...(paymentMethod && PAYMENT_METHODS.has(paymentMethod) ? { paymentMethod } : {}),
    ...(settlementNumber ? { settlementNumber: { contains: settlementNumber, mode: "insensitive" } } : {}),
  };
}

function buildReconciliationWhere(searchParams) {
  const gateway = clean(searchParams.get("gateway"));
  const runNumber = clean(searchParams.get("runNumber"));

  return {
    ...(gateway ? { gateway: { contains: gateway, mode: "insensitive" } } : {}),
    ...(runNumber ? { runNumber: { contains: runNumber, mode: "insensitive" } } : {}),
  };
}

function serializeSettlement(settlement) {
  return {
    id: settlement.id,
    settlementNumber: settlement.settlementNumber,
    paymentMethod: settlement.paymentMethod,
    gateway: settlement.gateway,
    totalAmount: serializeDecimal(settlement.totalAmount),
    status: settlement.status,
    settledAt: serializeDate(settlement.settledAt),
    createdAt: serializeDate(settlement.createdAt),
    updatedAt: serializeDate(settlement.updatedAt),
    lineCount: settlement._count?.lines || 0,
  };
}

function serializeReconciliationRun(run) {
  return {
    id: run.id,
    runNumber: run.runNumber,
    gateway: run.gateway,
    status: run.status,
    totalTransactions: run.totalTransactions,
    matchedTransactions: run.matchedTransactions,
    unmatchedTransactions: run.unmatchedTransactions,
    startedAt: serializeDate(run.startedAt),
    completedAt: serializeDate(run.completedAt),
    createdAt: serializeDate(run.createdAt),
    updatedAt: serializeDate(run.updatedAt),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const settlementWhere = buildSettlementWhere(searchParams);
  const reconciliationWhere = buildReconciliationWhere(searchParams);

  const [
    settlements,
    total,
    statusRows,
    totalAmount,
    totalReconciliationRuns,
    completedReconciliationRuns,
    reconciliationRuns,
  ] = await Promise.all([
    prisma.paymentSettlement.findMany({
      where: settlementWhere,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            lines: true,
          },
        },
      },
    }),
    prisma.paymentSettlement.count({ where: settlementWhere }),
    prisma.paymentSettlement.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.paymentSettlement.aggregate({
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.reconciliationRun.count(),
    prisma.reconciliationRun.count({ where: { status: "COMPLETED" } }),
    prisma.reconciliationRun.findMany({
      where: reconciliationWhere,
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    }),
  ]);

  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));

  return json({
    analytics: {
      totalSettlements: Object.values(countsByStatus).reduce((sum, count) => sum + count, 0),
      pendingSettlements: countsByStatus.PENDING || 0,
      processingSettlements: countsByStatus.PROCESSING || 0,
      completedSettlements: countsByStatus.COMPLETED || 0,
      failedSettlements: countsByStatus.FAILED || 0,
      totalSettlementAmount: serializeDecimal(totalAmount._sum.totalAmount),
      totalReconciliationRuns,
      completedReconciliationRuns,
    },
    settlements: settlements.map(serializeSettlement),
    reconciliationRuns: reconciliationRuns.map(serializeReconciliationRun),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
