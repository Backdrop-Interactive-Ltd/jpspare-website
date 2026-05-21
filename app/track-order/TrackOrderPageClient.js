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
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <header className="border-b border-[#dfe5ec] bg-white">
        <div className="mx-auto flex min-h-[145px] w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-start gap-5">
            <button type="button" onClick={() => router.back()} className="mt-9 inline-flex items-center gap-2 text-[16px] font-medium text-[#4b5563] transition hover:text-[#ef3338]">
              <Icon name="arrowLeft" className="size-5" />
              Back
            </button>
            <div>
              <h1 className="text-[32px] font-black tracking-[-0.03em] text-[#111827]">Track Your Order</h1>
              <p className="mt-7 text-[16px] text-[#4b5563]">Enter your order details to track your JPSPARE shipment</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[15px] text-[#667085] md:flex">
            <Icon name="package" className="size-5 text-[#ef3338]" />
            JPSPARE Order Tracking
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[940px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[14px] border border-[#dfe5ec] bg-white/90 px-8 py-10 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:px-12">
          <div className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-[12px] bg-[#ffe3e3] text-[#df171d]">
              <Icon name="search" className="size-9" />
            </span>
            <h2 className="mt-7 text-[32px] font-black tracking-[-0.03em] text-[#111827]">Track Your Order</h2>
            <p className="mt-5 text-[17px] text-[#4b5563]">Enter your order number and email address to view your order status</p>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-[455px] space-y-7">
            <label htmlFor="order-number" className="block">
              <span className="mb-3 block text-[15px] font-black text-[#111827]">Order Number</span>
              <input id="order-number" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="e.g., JP1001" className="h-[52px] w-full rounded-[7px] border border-[#cbd5e1] bg-white px-5 text-[16px] outline-none transition placeholder:text-[#9aa3af] focus:border-[#ef3338] focus:shadow-[0_0_0_3px_rgba(239,51,56,0.10)]" />
            </label>
            <label htmlFor="order-email" className="block">
              <span className="mb-3 block text-[15px] font-black text-[#111827]">Email Address</span>
              <input id="order-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your.email@example.com" className="h-[52px] w-full rounded-[7px] border border-[#cbd5e1] bg-white px-5 text-[16px] outline-none transition placeholder:text-[#9aa3af] focus:border-[#ef3338] focus:shadow-[0_0_0_3px_rgba(239,51,56,0.10)]" />
            </label>
            <button type="submit" className="flex h-[56px] w-full items-center justify-center gap-3 rounded-[10px] bg-gradient-to-r from-[#ef3f42] to-[#df171d] text-[16px] font-black text-white shadow-[0_14px_26px_rgba(239,51,56,0.18)] transition hover:from-[#111827] hover:to-[#111827]">
              <Icon name="search" className="size-5" />
              Track Order
            </button>
          </form>

          {message && <p className="mx-auto mt-6 max-w-[455px] rounded-[8px] bg-[#fff1f1] px-4 py-3 text-[14px] font-semibold text-[#c8191f]">{message}</p>}
          {result && (
            <div className="mx-auto mt-6 max-w-[455px] rounded-[10px] border border-[#bbf7d0] bg-[#ecfdf3] p-5">
              <p className="flex items-center gap-2 text-[15px] font-black text-[#027a48]">
                <Icon name="check" className="size-5" />
                Order found
              </p>
              <div className="mt-4 grid gap-2 text-[14px] text-[#344054]">
                <p><b>Order:</b> {result.order}</p>
                <p><b>Status:</b> {result.status}</p>
                <p><b>Estimated Delivery:</b> {result.eta}</p>
              </div>
            </div>
          )}

          <div className="mt-10 border-t border-[#dfe5ec] pt-7">
            <h3 className="text-[15px] font-black uppercase tracking-[0.12em] text-[#111827]">Sample order numbers for demo:</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {demoOrders.map((sample) => (
                <button key={sample.order} type="button" onClick={() => handleSampleSelect(sample)} className="rounded-[8px] border border-[#dfe5ec] bg-[#f8fafc] p-4 text-left transition hover:border-[#ef3338] hover:bg-[#fff5f5]">
                  <span className="block text-[15px] font-black text-[#111827]">{sample.order}</span>
                  <span className="mt-5 block text-[13px] text-[#4b5563]">{sample.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-[15px] font-semibold text-[#667085] transition hover:text-[#ef3338]">Back to Home</Link>
        </div>
      </section>
    </main>
  );
}
