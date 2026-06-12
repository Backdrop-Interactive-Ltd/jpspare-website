"use client";

import { useEffect, useMemo, useState } from "react";

const SALE_END_TIME = "2026-06-11T12:59:00+06:00";

function getRemainingTime() {
  const remainingMs = Math.max(0, new Date(SALE_END_TIME).getTime() - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export default function CouponCodeBanner() {
  const [remaining, setRemaining] = useState(() => getRemainingTime());
  const [copiedCode, setCopiedCode] = useState("");
  const coupons = useMemo(
    () => [
      { amount: "BDT1,841.65", order: "orders BDT12,154.88+", code: "AESS04" },
      { amount: "BDT1,227.77", order: "orders BDT8,471.59+", code: "AESS03" },
      { amount: "BDT736.66", order: "orders BDT4,788.29+", code: "AESS02" },
    ],
    []
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(getRemainingTime());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  async function handleCopy(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1400);
    } catch {
      setCopiedCode("");
    }
  }

  return (
    <section className="bg-transparent pt-2 pb-4 max-sm:pt-1">
      <div className="w-full max-w-none px-0">
        <div className="relative min-h-[360px] overflow-hidden bg-[#ef3338] px-8 py-8 text-white shadow-[0_18px_42px_rgba(239,51,56,0.18)] max-lg:px-5 max-sm:min-h-[420px] max-sm:px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(247,217,95,0.30),transparent_20%),linear-gradient(90deg,#111827_0%,#dc171d_46%,#ff6b1d_100%)]" />
          <div className="absolute inset-y-0 right-0 w-[54%] bg-[url('/jpspare-hero-slide-2.png')] bg-cover bg-center opacity-28 mix-blend-screen max-lg:w-[72%] max-sm:opacity-18" />
          <div className="absolute right-[24%] top-[92px] z-10 grid size-[86px] place-items-center rounded-full bg-[#f7d95f] text-center text-[18px] font-black leading-[0.9] text-[#dc171d] shadow-[0_14px_28px_rgba(15,23,42,0.22)] ring-4 ring-white/60 max-lg:right-8 max-sm:hidden">
            <span>
              Up to<br />
              <span className="text-[27px]">80%</span>
              <br />
              Off
            </span>
          </div>

          <div className="relative z-20 mx-auto flex w-[calc(100%-40px)] max-w-none flex-col sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
            <div className="flex items-center gap-3 text-[16px] font-black max-sm:flex-wrap">
              <span className="text-[22px] uppercase tracking-[-0.02em] text-[#f7d95f]">Summer Sale</span>
              <span>
                Ends: Jun 11, 12:59 (GMT+6)
              </span>
              <span className="rounded-full bg-white/14 px-3 py-1 font-mono text-[13px] ring-1 ring-white/20">
                {remaining.days}d {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
              </span>
            </div>

            <h2 className="mt-14 text-[64px] font-black leading-none tracking-[-0.04em] max-lg:mt-10 max-sm:text-[42px]">
              Parts life
            </h2>

            <div className="mt-12 flex items-stretch gap-3 overflow-hidden max-lg:mt-10 max-sm:mt-8">
              <button className="grid min-w-[42px] place-items-center rounded-[10px] bg-white text-[#111827] transition hover:bg-[#f7d95f]" aria-label="Previous coupon">
                <span className="text-[30px] leading-none">‹</span>
              </button>

              <div className="grid min-w-0 flex-1 grid-cols-3 gap-4 overflow-hidden max-xl:grid-cols-[repeat(3,minmax(460px,1fr))] max-xl:overflow-x-auto max-sm:grid-cols-[repeat(3,minmax(300px,1fr))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="grid min-w-0 grid-cols-[minmax(0,1fr)_118px] overflow-hidden rounded-[10px] bg-white text-[#111827] max-sm:grid-cols-1">
                    <div className="px-8 py-4 max-2xl:px-6 max-sm:px-5">
                      <p className="text-[36px] font-black leading-none tracking-[-0.045em] text-[#ef3338] max-2xl:text-[32px] max-sm:text-[29px]">
                        {coupon.amount}<span className="ml-1 align-baseline text-[19px] font-extrabold tracking-normal">OFF</span>
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-[20px] font-semibold leading-none max-2xl:text-[18px] max-sm:text-[17px]">
                        <span className="font-black text-[#ff9a9d]">{coupon.order}</span>
                        <span className="h-7 w-px bg-[#ffd1d2]" aria-hidden="true" />
                        <span className="font-medium text-[#5f6675]">Code: {coupon.code}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className="m-0 grid place-items-center border-l border-[#ffe1e2] bg-white px-3 text-[14px] font-black text-white transition max-sm:min-h-16 max-sm:border-l-0 max-sm:border-t"
                    >
                      <span className="inline-flex min-w-[92px] items-center justify-center rounded-full bg-[#ef3338] px-6 py-3 text-white transition hover:bg-[#dc171d]">
                        {copiedCode === coupon.code ? "Copied" : "Copy"}
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              <button className="grid min-w-[42px] place-items-center rounded-[10px] bg-white text-[#111827] transition hover:bg-[#f7d95f]" aria-label="Next coupon">
                <span className="text-[30px] leading-none">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
