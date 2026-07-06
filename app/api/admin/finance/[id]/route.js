import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function settlementId(context) {
  return (await context.params).id;
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function serializeDecimal(value) {
  return value?.toString?.() ?? value ?? "0";
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
  };
}

function serializeLine(line) {
  return {
    id: line.id,
    amount: serializeDecimal(line.amount),
    status: line.status,
    createdAt: serializeDate(line.createdAt),
    order: line.order
      ? {
          id: line.order.id,
          orderNumber: line.order.orderNumber,
          status: line.order.status,
          paymentStatus: line.order.paymentStatus,
          total: serializeDecimal(line.order.total),
        }
      : null,
    payment: line.payment
      ? {
          id: line.payment.id,
          method: line.payment.method,
          status: line.payment.status,
          amount: serializeDecimal(line.payment.amount),
          gateway: line.payment.gateway,
          transactionId: line.payment.transactionId,
          paidAt: serializeDate(line.payment.paidAt),
          createdAt: serializeDate(line.payment.createdAt),
        }
      : null,
  };
}

function serializeReconciliation(run) {
  if (!run) return null;
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

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const settlement = await prisma.paymentSettlement.findUnique({
    where: { id: await settlementId(context) },
    include: {
      lines: {
        orderBy: [{ createdAt: "desc" }],
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              paymentStatus: true,
              total: true,
            },
          },
          payment: {
            select: {
              id: true,
              method: true,
              status: true,
              amount: true,
              gateway: true,
              transactionId: true,
              paidAt: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!settlement) return apiError("Settlement not found.", 404);

  const reconciliation = settlement.gateway
    ? await prisma.reconciliationRun.findFirst({
        where: { gateway: settlement.gateway },
        orderBy: [{ createdAt: "desc" }],
      })
    : null;

  return json({
    settlement: serializeSettlement(settlement),
    lines: settlement.lines.map(serializeLine),
    reconciliation: serializeReconciliation(reconciliation),
  });
}
