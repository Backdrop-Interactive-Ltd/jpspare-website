import Link from "next/link";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { serializeOrder } from "../../../../lib/commerce/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ORDER_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "SUPPORT_STAFF", "CONTENT_EDITOR"];
const ORDER_STATUS_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "SUPPORT_STAFF"];
const ORDER_FULL_ROLES = ["SUPER_ADMIN", "ADMIN"];

function money(value) {
  const number = Number(value || 0);
  return `৳${number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/orders?${next.toString()}`;
}

function statusClass(status) {
  if (status === "DELIVERED" || status === "PAID") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "CANCELLED" || status === "FAILED") return "bg-gray-100 text-gray-600 ring-gray-200";
  if (status === "SHIPPED" || status === "PROCESSING" || status === "CONFIRMED") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function label(value) {
  if (!value) return "N/A";
  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildOrderSqlFilters({ query, status, paymentStatus }) {
  const clauses = [];
  const values = [];

  if (status) {
    values.push(status);
    clauses.push(`"status"::text = $${values.length}`);
  }

  if (paymentStatus) {
    values.push(paymentStatus);
    clauses.push(`"paymentStatus"::text = $${values.length}`);
  }

  if (query) {
    values.push(`%${query}%`);
    const index = values.length;
    clauses.push(`(
      "orderNumber" ILIKE $${index} OR
      "customerEmail" ILIKE $${index} OR
      "customerName" ILIKE $${index} OR
      "customerPhone" ILIKE $${index}
    )`);
  }

  return {
    values,
    whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
  };
}

async function loadOrdersWithRawSql({ query, status, paymentStatus, page, limit }) {
  const { values, whereSql } = buildOrderSqlFilters({ query, status, paymentStatus });
  const offset = (page - 1) * limit;

  const orders = await prisma.$queryRawUnsafe(
    `SELECT * FROM "Order" ${whereSql} ORDER BY "createdAt" DESC OFFSET $${values.length + 1} LIMIT $${values.length + 2}`,
    ...values,
    offset,
    limit
  );

  const totalRows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS count FROM "Order" ${whereSql}`,
    ...values
  );

  if (!orders.length) return { ordersRaw: [], total: Number(totalRows?.[0]?.count || 0) };

  const orderIds = orders.map((order) => order.id);
  const placeholders = orderIds.map((_, index) => `$${index + 1}`).join(", ");

  const [items, payments, customers] = await Promise.all([
    prisma.$queryRawUnsafe(`SELECT * FROM "OrderItem" WHERE "orderId" IN (${placeholders})`, ...orderIds),
    prisma.$queryRawUnsafe(`SELECT * FROM "Payment" WHERE "orderId" IN (${placeholders}) ORDER BY "createdAt" DESC`, ...orderIds),
    prisma.$queryRawUnsafe(
      `SELECT * FROM "Customer" WHERE "id" IN (${orders
        .map((order) => order.customerId)
        .filter(Boolean)
        .map((_, index) => `$${index + 1}`)
        .join(", ") || "NULL"})`,
      ...orders.map((order) => order.customerId).filter(Boolean)
    ),
  ]);

  return {
    total: Number(totalRows?.[0]?.count || 0),
    ordersRaw: orders.map((order) => ({
      ...order,
      customer: customers.find((customer) => customer.id === order.customerId) || null,
      items: items.filter((item) => item.orderId === order.id),
      payments: payments.filter((payment) => payment.orderId === order.id),
    })),
  };
}

export default async function AdminOrdersPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, ORDER_READ_ROLES);
  const canUpdateStatus = hasRole(user, ORDER_STATUS_ROLES);
  const canFullyManage = hasRole(user, ORDER_FULL_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const query = params.get("q") || "";
  const status = params.get("status") || "";
  const paymentStatus = params.get("paymentStatus") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 15;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Orders</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view orders.</p>
      </div>
    );
  }

  const where = {
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" } },
            { customerEmail: { contains: query, mode: "insensitive" } },
            { customerName: { contains: query, mode: "insensitive" } },
            { customerPhone: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const { ordersRaw, total } = prisma.order
    ? {
        ordersRaw: (await prisma.order.findMany({
          where,
          include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        })),
        total: await prisma.order.count({ where }),
      }
    : await loadOrdersWithRawSql({ query, status, paymentStatus, page, limit });

  const orders = ordersRaw.map(serializeOrder);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Commerce</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Orders</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Manage order lifecycle, payment state, and ERP/BMS-ready sync fields.</p>
          </div>
          {canFullyManage ? (
            <span className="inline-flex h-11 items-center rounded-xl bg-emerald-50 px-5 text-sm font-black text-emerald-700 ring-1 ring-emerald-200">Manage access</span>
          ) : canUpdateStatus ? (
            <span className="inline-flex h-11 items-center rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-black text-blue-700">Status access</span>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
        <input name="q" defaultValue={query} placeholder="Search order number, customer email, or phone" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All order status</option>
          {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((item) => (
            <option key={item} value={item}>{label(item)}</option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={paymentStatus} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All payment status</option>
          {["UNPAID", "PAID", "FAILED", "REFUNDED"].map((item) => (
            <option key={item} value={item}>{label(item)}</option>
          ))}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
        <Link href="/admin/orders" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#d0d5dd] px-5 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
          Reset
        </Link>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1160px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Order Status</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">ERP/BMS</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{order.externalOrderId || "Internal order"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-black text-[#111827]">{order.customerName || "Guest Customer"}</p>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{order.customerEmail || "No email"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-[#344054]">{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#ef3338]">{money(order.total)}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(order.status)}`}>{label(order.status)}</span></td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(order.paymentStatus)}`}>{label(order.paymentStatus)}</span>
                    <p className="mt-2 text-xs font-black text-[#111827]">{label(order.paymentMethod)}</p>
                    <p className="mt-1 max-w-[160px] truncate text-xs font-bold text-[#667085]">
                      {label(order.paymentGateway || order.payments?.[0]?.gateway)}
                      {order.transactionId || order.payments?.[0]?.transactionId ? ` • ${order.transactionId || order.payments?.[0]?.transactionId}` : ""}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-[#111827]">{label(order.source)}</p>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{label(order.syncStatus)}{order.lastSyncedAt ? ` • ${new Date(order.lastSyncedAt).toLocaleDateString("en-GB")}` : ""}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!orders.length ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No orders found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Orders will appear here after checkout.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} orders
        </p>
        <div className="flex gap-2">
          <Link aria-disabled={page <= 1} href={page <= 1 ? "#" : buildHref(params, { page: page - 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page <= 1 ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "border border-[#d0d5dd] text-[#344054]"}`}>Previous</Link>
          <Link aria-disabled={page >= totalPages} href={page >= totalPages ? "#" : buildHref(params, { page: page + 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page >= totalPages ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "bg-[#ef3338] text-white"}`}>Next</Link>
        </div>
      </div>
    </div>
  );
}
