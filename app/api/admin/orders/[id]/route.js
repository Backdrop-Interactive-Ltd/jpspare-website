import { prisma, requireAdminApi, apiError, json } from "../../_utils";
import { cancelOrderStock, confirmOrderStock } from "../../../../../lib/commerce/inventory";
import { ORDER_STATUSES, getOrderWithDetails, serializeOrder } from "../../../../../lib/commerce/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const READ_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "SUPPORT_STAFF", "CONTENT_EDITOR"];
const STATUS_WRITE_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "SUPPORT_STAFF"];
const FULL_WRITE_ROLES = ["SUPER_ADMIN", "ADMIN"];
const ADMIN_PAYMENT_STATUSES = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

function hasAnyRole(session, allowedRoles = []) {
  return (session?.user?.roles || []).some((role) => role === "SUPER_ADMIN" || allowedRoles.includes(role));
}

export async function GET(_request, { params }) {
  try {
    const auth = await requireAdminApi(READ_ROLES);
    if (auth.response) return auth.response;

    const { id } = await params;
    const order = await getOrderWithDetails({ OR: [{ id }, { orderNumber: id }] });

    if (!order) {
      return json({ error: "Order not found" }, 404);
    }

    return json({ order: serializeOrder(order) });
  } catch (error) {
    return apiError(error?.message || "Unable to load order details.");
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminApi(STATUS_WRITE_ROLES);
    if (auth.response) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const data = {};
    const entries = [];
    const note = String(body.note || "").trim();
    const canFullyManage = hasAnyRole(auth.session, FULL_WRITE_ROLES);
    const actor = auth.session?.user?.email || auth.session?.user?.name || "Admin user";

    if (body.status && ORDER_STATUSES.includes(body.status)) {
      data.status = body.status;
    }

    if (body.paymentStatus && !canFullyManage) {
      return json({ error: "Your role can update order status only." }, 403);
    }

    if (note && !canFullyManage) {
      return json({ error: "Your role can update order status only." }, 403);
    }

    if (body.paymentStatus && !ADMIN_PAYMENT_STATUSES.includes(body.paymentStatus)) {
      return json({ error: "Invalid payment status. Use unpaid, paid, failed, or refunded." }, 422);
    }

    if (body.paymentStatus && canFullyManage) {
      data.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === "PAID") {
        data.paidAt = new Date();
      }
    }

    const existing = await getOrderWithDetails({ OR: [{ id }, { orderNumber: id }] });
    if (!existing) {
      return json({ error: "Order not found" }, 404);
    }

    if (data.status && data.status !== existing.status) {
      entries.push({
        type: "STATUS",
        status: data.status,
        paymentStatus: data.paymentStatus || existing.paymentStatus,
        title: "Order status updated",
        message: `Order status changed from ${existing.status} to ${data.status}.`,
        actor,
        at: new Date().toISOString(),
      });
    }

    if (data.paymentStatus && data.paymentStatus !== existing.paymentStatus) {
      entries.push({
        type: "PAYMENT",
        status: data.status || existing.status,
        paymentStatus: data.paymentStatus,
        title: "Payment status updated",
        message: `Payment status changed from ${existing.paymentStatus} to ${data.paymentStatus}.`,
        actor,
        at: new Date().toISOString(),
      });
    }

    if (note) {
      entries.push({
        type: "NOTE",
        status: data.status || existing.status,
        paymentStatus: data.paymentStatus || existing.paymentStatus,
        title: "Internal note",
        message: note,
        actor,
        at: new Date().toISOString(),
      });
    }

    if (!Object.keys(data).length && !entries.length) {
      return json({ error: "No valid order changes were provided." }, 422);
    }

    if (entries.length) {
      data.timeline = [...((Array.isArray(existing.timeline) && existing.timeline) || []), ...entries];
    }

    const order = await prisma.$transaction(async (tx) => {
      if (data.status && data.status !== existing.status) {
        const adminUserId = auth.session?.user?.id || null;

        if (data.status === "CONFIRMED") {
          await confirmOrderStock(tx, existing, {
            adminUserId,
            reason: `Order ${existing.orderNumber} confirmed by ${actor}.`,
          });
        }

        if (data.status === "CANCELLED") {
          await cancelOrderStock(tx, existing, {
            adminUserId,
            reason: `Order ${existing.orderNumber} cancelled by ${actor}.`,
          });
        }
      }

      const updated = await tx.order.update({
        where: { id: existing.id },
        data,
        include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
      });

      if (data.paymentStatus) {
        const latestPayment = existing.payments?.[0];

        if (latestPayment) {
          await tx.payment.update({
            where: { id: latestPayment.id },
            data: {
              status: data.paymentStatus,
              paidAt: data.paymentStatus === "PAID" ? new Date() : latestPayment.paidAt,
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: existing.id,
              method: existing.paymentMethod,
              status: data.paymentStatus,
              amount: existing.total,
              paidAt: data.paymentStatus === "PAID" ? new Date() : null,
            },
          });
        }
      }

      return tx.order.findUnique({
        where: { id: updated.id },
        include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
      });
    });

    return json({ order: serializeOrder(order) });
  } catch (error) {
    return apiError(error?.message || "Unable to update order.");
  }
}
