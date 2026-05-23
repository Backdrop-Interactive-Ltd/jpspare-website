import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { serializeOrder } from "../../../../lib/commerce/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function money(value) {
  return `৳${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function label(value) {
  if (!value) return "N/A";
  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString("en-GB") : "N/A";
}

function StatusPill({ label, value, tone = "red" }) {
  const styles = {
    red: "border-[#fecaca] bg-[#fff1f1] text-[#c8191f]",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className={`rounded-[12px] border px-4 py-3 ${styles[tone] || styles.red}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-1 text-[15px] font-black">{value}</p>
    </div>
  );
}

export default async function CheckoutSuccessPage({ params }) {
  const { orderNumber } = await params;
  const orderRaw = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!orderRaw) notFound();
  const order = serializeOrder(orderRaw);
  const shippingAddress = order.shippingAddress || {};
  const latestPayment = order.payments?.[0];
  const paymentGateway = order.paymentGateway || latestPayment?.gateway || (order.paymentMethod === "SSLCOMMERZ" ? "SSLCOMMERZ" : "N/A");
  const transactionId = order.transactionId || latestPayment?.transactionId || "N/A";
  const paidAt = order.paidAt || latestPayment?.paidAt;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_14%_20%,rgba(247,217,95,0.08),transparent_24%),radial-gradient(circle_at_86%_60%,rgba(239,51,56,0.06),transparent_28%),#ffffff] px-4 py-12 text-[#111827] sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-[1100px]">
        <div className="rounded-[18px] border border-[#dfe5ec] bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Order Confirmed</p>
          <h1 className="mt-2 text-[36px] font-black tracking-[-0.04em] max-sm:text-[30px]">Thank you for your order</h1>
          <p className="mt-3 text-[17px] font-medium text-[#5f6878]">
            Your JPSPARE order number is <span className="font-black text-[#ef3338]">{order.orderNumber}</span>.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatusPill label="Payment Status" value={order.paymentStatus} tone={order.paymentStatus === "PAID" ? "green" : "red"} />
            <StatusPill label="Delivery Status" value={order.status} tone="blue" />
            <StatusPill label="Order Total" value={money(order.total)} tone="green" />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-[16px] border border-[#dfe5ec] bg-white shadow-sm">
            <header className="border-b border-[#eef0f3] px-5 py-4">
              <h2 className="text-[20px] font-black">Order Summary</h2>
            </header>
            <div className="divide-y divide-[#eef0f3]">
              {order.items.map((item) => (
                <article key={item.id} className="grid grid-cols-[76px_1fr_auto] gap-4 px-5 py-4 max-sm:grid-cols-1">
                  <img src={item.imageUrl || "/jpspare-logo.png"} alt={item.productTitle} className="size-[76px] rounded-[10px] border border-[#e5e7eb] object-cover" />
                  <div>
                    <h3 className="font-black text-[#111827]">{item.productTitle}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#667085]">SKU: {item.sku || "N/A"} • Qty: {item.quantity}</p>
                    <p className="mt-1 text-xs font-bold text-[#98a2b3]">{money(item.unitPrice)} each</p>
                  </div>
                  <p className="text-right text-[17px] font-black text-[#ef3338] max-sm:text-left">{money(item.total)}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[16px] border border-[#dfe5ec] bg-white p-5 shadow-sm">
              <h2 className="text-[18px] font-black">Customer Details</h2>
              <div className="mt-4 space-y-2 text-sm font-semibold text-[#667085]">
                <p><span className="font-black text-[#111827]">Name:</span> {order.customerName || "Guest Customer"}</p>
                <p><span className="font-black text-[#111827]">Email:</span> {order.customerEmail || "N/A"}</p>
                <p><span className="font-black text-[#111827]">Phone:</span> {order.customerPhone || "N/A"}</p>
                <p><span className="font-black text-[#111827]">Address:</span> {[shippingAddress.addressLine1, shippingAddress.area, shippingAddress.city, shippingAddress.country].filter(Boolean).join(", ") || "N/A"}</p>
              </div>
            </section>

            <section className="rounded-[16px] border border-[#dfe5ec] bg-white p-5 shadow-sm">
              <h2 className="text-[18px] font-black">Payment</h2>
              <div className="mt-4 space-y-3 text-sm font-bold text-[#344054]">
                <div className="flex justify-between gap-4"><span>Method</span><span className="text-right">{label(latestPayment?.method || order.paymentMethod)}</span></div>
                <div className="flex justify-between gap-4"><span>Status</span><span className="text-right">{label(latestPayment?.status || order.paymentStatus)}</span></div>
                <div className="flex justify-between gap-4"><span>Gateway</span><span className="text-right">{label(paymentGateway)}</span></div>
                <div className="flex justify-between gap-4"><span>Transaction ID</span><span className="max-w-[190px] truncate text-right">{transactionId}</span></div>
                <div className="flex justify-between gap-4"><span>Paid At</span><span className="text-right">{dateTime(paidAt)}</span></div>
                <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className="text-emerald-600">{order.deliveryCharge ? money(order.deliveryCharge) : "Free"}</span></div>
                <div className="flex justify-between border-t border-[#e5e7eb] pt-3 text-lg font-black text-[#111827]"><span>Total</span><span>{money(order.total)}</span></div>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/account/orders" className="inline-flex h-12 items-center justify-center rounded-[10px] bg-[#ef3338] px-6 font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#111827]">View My Orders</Link>
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-[10px] border border-[#dfe5ec] bg-white px-6 font-black text-[#273142] transition hover:border-[#ef3338] hover:text-[#ef3338]">Continue Shopping</Link>
        </div>
      </section>
    </main>
  );
}
