"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const demoOrders = [
  { order: "3526", email: "mubtaseemzawadfb@gmail.com", status: "Processing", eta: "24-48 hours" },
  { order: "JP1002", email: "test@jpspare.com", status: "Ready to Ship", eta: "Tomorrow" },
];

function Icon({ name, className = "size-5" }) {
  const icons = {
    arrowLeft: "M19 12H5m7-7-7 7 7 7",
    search: "M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
    package: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.5 8.5 12 13l8.5-4.5M12 22v-9",
    check: "M20 6 9 17l-5-5",
    mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm-1 3 9 6 9-6",
    truck: "M10 17h4V5H2v12h3m9-8h4l4 4v4h-3m-11 0h8M8 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    shield: "M12 3 19 6v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z",
    clock: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default function TrackOrderPageClient() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const match = demoOrders.find((item) => item.order.toLowerCase() === orderNumber.trim().toLowerCase() && item.email.toLowerCase() === email.trim().toLowerCase());

    if (!match) {
      setResult(null);
      setMessage("No matching demo order found. Try one of the sample orders below.");
      return;
    }

    setMessage("");
    setResult(match);
  };

  const handleSampleSelect = (sample) => {
    setOrderNumber(sample.order);
    setEmail(sample.email);
    setResult(null);
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#111827]">
      <section className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[8px] border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] p-6 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_20%,rgba(239,51,56,0.12),transparent_34%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 text-[14px] font-black text-white/70 transition hover:text-[#ff5b61]"><Icon name="arrowLeft" className="size-4" /> Back</button>
              <p className="mt-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#ff5b61]"><Icon name="package" className="size-4" /> JPSPARE Order Tracking</p>
              <h1 className="mt-3 text-[36px] font-black leading-tight tracking-[-0.03em] text-white sm:text-[46px]">Track Your <span className="text-[#ff4a50]">Order</span></h1>
              <p className="mt-3 max-w-[620px] text-[16px] font-medium leading-7 text-white/68">Enter your order details to view the latest shipment status and estimated delivery timeline.</p>
            </div>
            <div className="grid min-w-[320px] grid-cols-3 gap-2 rounded-[8px] border border-white/15 bg-white/8 p-3 backdrop-blur-sm">
              {[["package", "Order confirmed"], ["truck", "Live progress"], ["shield", "Secure lookup"]].map(([icon, label]) => (
                <div key={label} className="flex min-h-[86px] flex-col items-center justify-center rounded-[7px] bg-black/15 px-2 text-center">
                  <Icon name={icon} className="size-5 text-[#ff5b61]" />
                  <span className="mt-2 text-[11px] font-black text-white/72">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[8px] border border-[#e4e9f0] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.07)] sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-[#fff1f1] text-[#ef3338]"><Icon name="search" className="size-6" /></span>
              <div><h2 className="text-[24px] font-black tracking-[-0.02em]">Find your shipment</h2><p className="mt-1 text-[14px] font-medium leading-6 text-[#667085]">Use the same order number and email used during checkout.</p></div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label htmlFor="order-number" className="block">
                <span className="mb-2 block text-[13px] font-black text-[#111827]">Order Number</span>
                <div className="relative"><Icon name="package" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#98a2b3]" /><input id="order-number" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="e.g., JP1001" className="h-[54px] w-full rounded-[8px] border border-[#d7dee8] bg-[#fbfcfd] pl-12 pr-4 text-[15px] outline-none transition placeholder:text-[#9aa3af] focus:border-[#ef3338] focus:bg-white focus:shadow-[0_0_0_3px_rgba(239,51,56,0.10)]" /></div>
              </label>
              <label htmlFor="order-email" className="block">
                <span className="mb-2 block text-[13px] font-black text-[#111827]">Email Address</span>
                <div className="relative"><Icon name="mail" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#98a2b3]" /><input id="order-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your.email@example.com" className="h-[54px] w-full rounded-[8px] border border-[#d7dee8] bg-[#fbfcfd] pl-12 pr-4 text-[15px] outline-none transition placeholder:text-[#9aa3af] focus:border-[#ef3338] focus:bg-white focus:shadow-[0_0_0_3px_rgba(239,51,56,0.10)]" /></div>
              </label>
              <button type="submit" className="group/track flex h-[54px] w-full items-center justify-center gap-3 rounded-[8px] !bg-[#ef3338] text-[15px] font-black !text-white shadow-[0_14px_28px_rgba(239,51,56,0.20)] transition-transform hover:scale-[1.015] hover:!bg-[#ef3338] active:scale-[0.99]"><Icon name="search" className="size-5 transition-transform group-hover/track:scale-110" /> Track Order</button>
            </form>

            {message && <p className="mt-5 rounded-[8px] border border-[#ffd7d9] bg-[#fff1f1] px-4 py-3 text-[14px] font-semibold text-[#c8191f]">{message}</p>}
            {result && (
              <div className="mt-5 overflow-hidden rounded-[8px] border border-[#bbf7d0] bg-[#f0fdf4]">
                <div className="flex items-center gap-3 border-b border-[#d1fae5] px-5 py-4 text-[#027a48]"><span className="grid size-8 place-items-center rounded-full bg-[#dcfce7]"><Icon name="check" className="size-5" /></span><p className="text-[15px] font-black">Order found</p></div>
                <div className="grid gap-4 p-5 sm:grid-cols-3">{[["Order", result.order], ["Status", result.status], ["Estimated delivery", result.eta]].map(([label, value]) => <div key={label}><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#667085]">{label}</p><p className="mt-2 text-[14px] font-black text-[#111827]">{value}</p></div>)}</div>
              </div>
            )}
          </div>

          <aside className="overflow-hidden rounded-[8px] border border-[#e4e9f0] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
            <div className="bg-[#111827] p-6 text-white"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ff5b61]">Quick Demo</p><h2 className="mt-2 text-[22px] font-black">Try a sample order</h2><p className="mt-2 text-[13px] font-medium leading-6 text-white/60">Select a saved example to fill the tracking form instantly.</p></div>
            <div className="grid gap-3 p-5">
              {demoOrders.map((sample) => (
                <button key={sample.order} type="button" onClick={() => handleSampleSelect(sample)} className="group rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left transition hover:border-[#ffd7d9] hover:bg-[#fff1f1] hover:shadow-[0_12px_24px_rgba(239,51,56,0.10)]">
                  <span className="flex items-center justify-between gap-3"><span className="text-[15px] font-black text-[#111827]">{sample.order}</span><span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-black text-[#059669]">{sample.status}</span></span>
                  <span className="mt-3 flex items-center gap-2 text-[12px] text-[#667085]"><Icon name="mail" className="size-4" />{sample.email}</span>
                  <span className="mt-2 flex items-center gap-2 text-[12px] text-[#667085]"><Icon name="clock" className="size-4" />ETA: {sample.eta}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-[#e5e7eb] bg-[#fbfcfd] p-5"><p className="flex items-start gap-3 text-[13px] font-medium leading-6 text-[#667085]"><Icon name="shield" className="mt-0.5 size-5 shrink-0 text-[#ef3338]" />Your order details are used only to retrieve shipment information securely.</p></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
