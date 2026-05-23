"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AccountOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (response.status === 401) {
        router.push("/signin");
        return;
      }
      const data = response.ok ? await response.json() : { orders: [] };
      setOrders(data.orders || []);
      setLoading(false);
    }
    loadOrders();
  }, [router]);

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/account" className="text-sm font-black text-[#667085] hover:text-[#ef3338]">← Back to account</Link>
        <div className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">My Account</p>
          <h1 className="mt-2 text-[40px] font-black tracking-[-0.04em]">My Orders</h1>
          <p className="mt-3 text-[#667085]">Track your JPSPARE purchases and checkout history.</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[12px] border border-[#dfe5ec] bg-white shadow-sm">
          {loading ? <p className="p-8 text-center font-bold text-[#667085]">Loading orders...</p> : null}
          {!loading && !orders.length ? <p className="p-8 text-center font-bold text-[#667085]">No orders yet.</p> : null}
          <div className="divide-y divide-[#eef0f3]">
            {orders.map((order) => (
              <article key={order.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-black text-[#111827]">{order.orderNumber}</p>
                  <p className="mt-1 text-sm font-semibold text-[#667085]">{new Date(order.createdAt).toLocaleDateString("en-GB")} • {order.items?.length || 0} line items</p>
                  <p className="mt-1 text-xs font-bold text-[#98a2b3]">Payment: {label(order.paymentMethod)} • {label(order.paymentStatus)}</p>
                </div>
                <span className="w-fit rounded-full bg-[#fff3f3] px-3 py-1 text-xs font-black text-[#df171d] ring-1 ring-red-100">{order.status}</span>
                <p className="text-lg font-black text-[#ef3338]">{money(order.total)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
