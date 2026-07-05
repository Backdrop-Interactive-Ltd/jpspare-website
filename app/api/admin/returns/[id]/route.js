import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function returnId(context) {
  return (await context.params).id;
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function customerName(customer, order) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || order?.customerName || "Unknown customer";
}

function serializeReturnRequest(returnRequest) {
  return {
    id: returnRequest.id,
    returnNumber: returnRequest.returnNumber,
    status: returnRequest.status,
    reason: returnRequest.reason,
    notes: returnRequest.notes,
    requestedAt: serializeDate(returnRequest.requestedAt),
    completedAt: serializeDate(returnRequest.completedAt),
    createdAt: serializeDate(returnRequest.createdAt),
    updatedAt: serializeDate(returnRequest.updatedAt),
    customer: returnRequest.customer
      ? {
          id: returnRequest.customer.id,
          name: customerName(returnRequest.customer, returnRequest.order),
          email: returnRequest.customer.email || returnRequest.order?.customerEmail || null,
          phone: returnRequest.customer.phone || returnRequest.order?.customerPhone || null,
          status: returnRequest.customer.status,
        }
      : null,
    order: returnRequest.order
      ? {
          id: returnRequest.order.id,
          orderNumber: returnRequest.order.orderNumber,
          status: returnRequest.order.status,
          paymentStatus: returnRequest.order.paymentStatus,
          customerName: returnRequest.order.customerName,
          customerEmail: returnRequest.order.customerEmail,
          customerPhone: returnRequest.order.customerPhone,
          total: returnRequest.order.total?.toString?.() ?? returnRequest.order.total,
          createdAt: serializeDate(returnRequest.order.createdAt),
        }
      : null,
  };
}

function serializeItem(item) {
  return {
    id: item.id,
    quantity: item.quantity,
    reason: item.reason,
    createdAt: serializeDate(item.createdAt),
    product: item.product
      ? {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          sku: item.product.sku,
        }
      : null,
  };
}

function serializeInspection(inspection) {
  if (!inspection) return null;
  return {
    id: inspection.id,
    result: inspection.result,
    notes: inspection.notes,
    inspectedAt: serializeDate(inspection.inspectedAt),
    createdAt: serializeDate(inspection.createdAt),
    inspectedBy: inspection.inspectedBy
      ? {
          id: inspection.inspectedBy.id,
          name: inspection.inspectedBy.name,
          email: inspection.inspectedBy.email,
        }
      : null,
  };
}

function serializeRefund(refundCase) {
  if (!refundCase) return null;
  return {
    id: refundCase.id,
    refundStatus: refundCase.refundStatus,
    refundAmount: refundCase.refundAmount?.toString?.() ?? refundCase.refundAmount,
    refundMethod: refundCase.refundMethod,
    processedAt: serializeDate(refundCase.processedAt),
    createdAt: serializeDate(refundCase.createdAt),
    updatedAt: serializeDate(refundCase.updatedAt),
  };
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: await returnId(context) },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          total: true,
          createdAt: true,
        },
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
      items: {
        orderBy: [{ createdAt: "asc" }],
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              sku: true,
            },
          },
        },
      },
      inspection: {
        include: {
          inspectedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      refundCase: true,
    },
  });

  if (!returnRequest) return apiError("Return request not found.", 404);

  return json({
    returnRequest: serializeReturnRequest(returnRequest),
    items: returnRequest.items.map(serializeItem),
    inspection: serializeInspection(returnRequest.inspection),
    refundCase: serializeRefund(returnRequest.refundCase),
  });
}
