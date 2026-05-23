import { notFound } from "next/navigation";
import { requireAdminPage } from "../../../../../../lib/auth/admin";
import { hasRole } from "../../../../../../lib/auth/rbac";
import {
  INVOICE_ROLES,
  addressLines,
  ensureOrderInvoice,
  formatInvoiceLabel,
  formatInvoiceMoney,
} from "../../../../../../lib/commerce/invoice";
import InvoiceActions from "./InvoiceActions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function dateLabel(value) {
  return value ? new Date(value).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");
}

function StatusPill({ children }) {
  return (
    <span className="inline-flex rounded-full bg-[#fff3f3] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#ef3338] ring-1 ring-[#ffd0d0]">
      {children}
    </span>
  );
}

function AddressBlock({ title, lines }) {
  return (
    <section>
      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#98a2b3]">{title}</h2>
      <div className="mt-3 space-y-1 text-sm font-semibold leading-6 text-[#344054]">
        {lines.length ? lines.map((line, index) => <p key={`${title}-${index}`}>{line}</p>) : <p>No address provided.</p>}
      </div>
    </section>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @page { size: A4; margin: 13mm; }
      @media print {
        html, body { background: #ffffff !important; }
        .admin-print-hidden,
        aside,
        header,
        nav,
        button,
        [aria-label="Close admin navigation"] { display: none !important; }
        main { padding: 0 !important; }
        main > div { max-width: none !important; }
        .invoice-print-page {
          border: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
        }
        .invoice-page-wrap { padding: 0 !important; }
        .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
      }
    `}</style>
  );
}

export default async function AdminOrderInvoicePage({ params, searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };

  if (!hasRole(user, INVOICE_ROLES)) {
    notFound();
  }

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const documentType = resolvedSearchParams?.type === "packing-slip" ? "packing-slip" : "invoice";
  const isPackingSlip = documentType === "packing-slip";
  const actor = session.user.email || session.user.name || "Admin user";
  const order = await ensureOrderInvoice(id, actor);

  if (!order) notFound();

  const shippingLines = addressLines(order.shippingAddress, {
    name: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail,
  });
  const billingLines = addressLines(order.billingAddress, {
    name: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail,
  });

  return (
    <div className="invoice-page-wrap space-y-5">
      <PrintStyles />
      <InvoiceActions orderId={order.id} documentType={documentType} />

      <article className="invoice-print-page mx-auto max-w-[920px] rounded-[28px] border border-[#e5e7eb] bg-white p-8 shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#e5e7eb] pb-8">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-[#111827] p-2">
              <img src="/jpspare-logo.png" alt="JPSPARE" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-[#111827]">JPSPARE</p>
              <p className="mt-1 text-sm font-semibold text-[#667085]">Experience the authenticity</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ef3338]">{isPackingSlip ? "Packing Slip" : "Invoice"}</p>
            <h1 className="mt-2 text-3xl font-black text-[#111827]">{isPackingSlip ? order.orderNumber : order.invoiceNumber}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Order #{order.orderNumber}</p>
          </div>
        </header>

        <section className="grid gap-4 border-b border-[#e5e7eb] py-6 text-sm sm:grid-cols-4">
          <div>
            <p className="font-black text-[#111827]">Invoice Date</p>
            <p className="mt-1 font-semibold text-[#667085]">{dateLabel(order.invoiceGeneratedAt || order.createdAt)}</p>
          </div>
          <div>
            <p className="font-black text-[#111827]">Order Date</p>
            <p className="mt-1 font-semibold text-[#667085]">{dateLabel(order.createdAt)}</p>
          </div>
          <div>
            <p className="font-black text-[#111827]">Order Status</p>
            <p className="mt-1"><StatusPill>{formatInvoiceLabel(order.status)}</StatusPill></p>
          </div>
          <div>
            <p className="font-black text-[#111827]">Payment Status</p>
            <p className="mt-1"><StatusPill>{formatInvoiceLabel(order.paymentStatus)}</StatusPill></p>
          </div>
        </section>

        <section className="grid gap-8 border-b border-[#e5e7eb] py-8 md:grid-cols-3">
          <AddressBlock title="Customer Details" lines={[order.customerName || "Guest Customer", order.customerPhone, order.customerEmail].filter(Boolean)} />
          <AddressBlock title="Shipping Address" lines={shippingLines} />
          {!isPackingSlip ? <AddressBlock title="Billing Address" lines={billingLines} /> : null}
        </section>

        <section className="py-8">
          <div className="overflow-hidden rounded-2xl border border-[#e5e7eb]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th className="px-4 py-3 font-black">Product</th>
                  <th className="px-4 py-3 font-black">SKU</th>
                  <th className="px-4 py-3 text-center font-black">Qty</th>
                  {!isPackingSlip ? <th className="px-4 py-3 text-right font-black">Unit Price</th> : null}
                  {!isPackingSlip ? <th className="px-4 py-3 text-right font-black">Total</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {order.items.map((item) => (
                  <tr key={item.id} className="print-break-inside-avoid">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl || "/jpspare-logo.png"} alt={item.productTitle} className="size-12 rounded-xl border border-[#e5e7eb] object-cover" />
                        <span className="font-black text-[#111827]">{item.productTitle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#667085]">{item.sku || "N/A"}</td>
                    <td className="px-4 py-4 text-center font-black text-[#111827]">{item.quantity}</td>
                    {!isPackingSlip ? <td className="px-4 py-4 text-right font-semibold text-[#344054]">{formatInvoiceMoney(item.unitPrice)}</td> : null}
                    {!isPackingSlip ? <td className="px-4 py-4 text-right font-black text-[#111827]">{formatInvoiceMoney(item.total)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {!isPackingSlip ? (
          <section className="ml-auto w-full max-w-[360px] rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-5">
            <div className="space-y-3 text-sm font-bold text-[#344054]">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatInvoiceMoney(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery charge</span><span>{formatInvoiceMoney(order.deliveryCharge)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>{formatInvoiceMoney(order.discountTotal)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatInvoiceMoney(order.taxTotal)}</span></div>
              <div className="flex justify-between border-t border-[#d0d5dd] pt-4 text-lg font-black text-[#111827]"><span>Grand total</span><span>{formatInvoiceMoney(order.total)}</span></div>
            </div>
          </section>
        ) : null}

        <footer className="mt-10 rounded-2xl bg-[#111827] p-5 text-center text-sm font-semibold text-white">
          <p>{isPackingSlip ? "Please verify all package items before dispatch." : "Thank you for shopping with JPSPARE. All products are subject to warranty and return policy terms."}</p>
        </footer>
      </article>
    </div>
  );
}
