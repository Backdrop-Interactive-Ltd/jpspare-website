"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TopDealBar from "../TopDealBar";
import { Header } from "../page";

const dealCards = [
  ["Eid Utshob Deal", "Get amazing discount on Eid Utshob Deal!", "13 May 2026 - 27 May 2026", "Online", "from-blue-800 via-blue-600 to-orange-500", "80,000"],
  ["Eid Utshob | Home Appliances Deal", "Buy home appliances and get exciting discount!", "06 May 2026 - 31 May 2026", "Online", "from-blue-900 via-blue-600 to-cyan-500", "HOME"],
  ["Eid Utshob | Free Delivery Offer!", "Get free delivery on Eid Utshob!", "13 May 2026 - 27 May 2026", "Online", "from-blue-800 via-blue-600 to-amber-500", "FREE"],
  ["Goru Khojo - Eid-E Mojo", "Join the Eid campaign and win reward points.", "13 May 2026 - 27 May 2026", "Online", "from-blue-800 via-blue-700 to-orange-600", "MOJO"],
  ["Eid Utshob | bKash 1000Tk Cashback Offer!", "Get 1000Tk instant bKash cashback on online payment.", "13 May 2026 - 27 May 2026", "Online", "from-blue-900 via-pink-600 to-rose-500", "1000"],
  ["Mutual Trust Bank | Eid Cashback Offer", "Buy any product and get up to 5000 Tk cashback.", "10 May 2026 - 31 May 2026", "All Outlet", "from-white via-rose-200 to-emerald-500", "5000"],
  ["Eastern Bank | Eid Cashback Offer", "Buy any product and get up to 5000 Tk cashback.", "10 May 2026 - 31 May 2026", "All Branch", "from-blue-800 via-cyan-500 to-yellow-300", "5000"],
  ["City Bank Credit Card Cashback Offer", "Buy any product and get up to 5000 Tk cashback.", "15 May 2026 - 25 May 2026", "All Branch", "from-red-600 via-white to-slate-200", "CARD"],
];

const terms = [
  "Campaign-er jonno projojjo products-e discount, cashback, and free delivery facilities thakbe.",
  "Offer validity, stock, outlet, and payment method-er upor facility change hote pare.",
  "bKash, MTB, EBL and City Bank cashback tader nij nij policy onujayi projojjo.",
  "Ekjon customer ek ba ekadhik eligible order korte parben, kintu duplicate claim cancel hote pare.",
  "JPSPARE authority jekono somoy offer update, change, ba close korar odhikar rakhe.",
  "Order confirmation-er por delivery timeline customer support theke confirm kora hobe.",
];

function getTimeLeft() {
  const target = new Date("2026-05-27T23:59:59+06:00").getTime();
  const diff = Math.max(0, target - Date.now());

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Icon({ name, className = "size-3.5" }) {
  const paths = {
    calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
    store: "M4 10h16l-1.5-6h-13L4 10Zm2 0v10m12-10v10M9 20v-6h6v6",
    bolt: "m13 2-9 12h7l-1 8 9-12h-7l1-8Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function Poster({ title, accent, label }) {
  return (
    <div className={`relative aspect-[1/0.96] overflow-hidden bg-gradient-to-br ${accent} p-5 text-white`}>
      <div className="absolute -right-12 -top-14 size-40 rounded-full bg-white/16" />
      <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-black/20" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#174bbd]">JPSPARE</span>
        <span className="rounded-full bg-[#ef3338] px-3 py-1 text-[10px] font-black">Eid</span>
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <p className="text-[13px] font-black uppercase tracking-[0.24em] text-white/80">Eid Utshob</p>
        <h3 className="mt-3 text-[46px] font-black leading-none tracking-[-0.05em] drop-shadow max-sm:text-[36px]">{label}</h3>
        <p className="mt-4 max-w-[230px] text-[20px] font-black leading-tight drop-shadow">{title}</p>
      </div>
    </div>
  );
}

function CountdownBox({ value, label }) {
  return (
    <div className="min-w-[48px] rounded-[4px] border border-[#e5e7eb] bg-white px-2 py-2 text-center shadow-sm">
      <span className="block rounded-[3px] bg-[#ef3338] px-2 py-1 text-[18px] font-black leading-none text-white">{String(value).padStart(2, "0")}</span>
      <span className="mt-1 block text-[10px] font-semibold text-[#6b7280]">{label}</span>
    </div>
  );
}

export default function EidDealPageClient() {
  const [timeLeft, setTimeLeft] = useState(() => ({ days: 0, hours: 0, minutes: 0, seconds: 0 }));

  useEffect(() => {
    const updateCountdown = () => setTimeLeft(getTimeLeft());
    const initialTimer = setTimeout(updateCountdown, 0);
    const timer = setInterval(updateCountdown, 1000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, []);

  const countdownItems = useMemo(
    () => [
      [timeLeft.days, "Days"],
      [timeLeft.hours, "Hours"],
      [timeLeft.minutes, "Minutes"],
      [timeLeft.seconds, "Seconds"],
    ],
    [timeLeft],
  );

  return (
    <>
      <TopDealBar />
      <Header />
      <main className="bg-[#eef0f5] py-7 text-[#111827]">
        <section className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[4px] bg-white px-8 py-10 text-center shadow-sm max-sm:px-4">
            <h1 className="text-[22px] font-black leading-8">পবিত্র ঈদ উৎসব উপলক্ষে চলছে ঈদ টক Eid Utshob!</h1>
            <p className="mx-auto mt-4 max-w-[980px] text-[15px] font-semibold leading-7 text-[#1f2937]">
              আপনার পছন্দের Laptop, Desktop, Monitor, Smart Watch, Keyboard, Mouse, Headphone-সহ পণ্য গাড়ির সর্বোচ্চ 80,000 টাকা মূল্যছাড়। সাথে EIDSTAR প্রোমোকোড ব্যবহার করে উপভোগ করুন Free Home Delivery!
            </p>
            <div className="mt-7">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#374151]">Ending In</p>
              <div className="mt-2 flex justify-center gap-2">
                {countdownItems.map(([value, label]) => (
                  <CountdownBox key={label} value={value} label={label} />
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <a href="#eid-utshob" className="rounded-full border border-[#d1d5db] px-5 py-2 text-[12px] font-bold transition hover:border-[#ef3338] hover:text-[#ef3338]">Eid Utshob</a>
              <a href="#eid-terms" className="rounded-full border border-[#d1d5db] px-5 py-2 text-[12px] font-bold transition hover:border-[#ef3338] hover:text-[#ef3338]">Eid Utshob | Terms & Conditions</a>
            </div>
          </div>
        </section>

        <section id="eid-utshob" className="mx-auto mt-20 w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-[28px] font-black">Eid Utshob</h2>
            <p className="mt-3 text-[15px] font-semibold text-[#374151]">Enjoy exciting discount, bKash cashback, and free home delivery on Eid Utshob!</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-x-8 gap-y-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {dealCards.map(([title, description, date, channel, accent, label]) => (
              <article key={title} className="bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.13)]">
                <Poster title={title} accent={accent} label={label} />
                <div className="px-4 pb-5 pt-3 text-center">
                  <div className="mb-4 flex items-center justify-between border-b border-[#edf0f4] pb-2 text-[11px] font-semibold text-[#4b5563]">
                    <span className="inline-flex items-center gap-1"><Icon name="calendar" />{date}</span>
                    <span className="inline-flex items-center gap-1"><Icon name="store" />{channel}</span>
                  </div>
                  <h3 className="text-[18px] font-black text-[#1f2937]">{title}</h3>
                  <p className="mt-3 min-h-8 text-[12px] font-medium leading-5 text-[#6b7280]">{description}</p>
                  <Link href="/sale-offer" className="mt-5 inline-flex h-10 items-center justify-center rounded-[3px] bg-[#174bbd] px-6 text-[12px] font-black text-white transition hover:bg-[#ef3338]">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="eid-terms" className="mx-auto mt-12 w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 shadow-sm max-sm:p-5">
            <h2 className="text-[24px] font-black">ঈদ উৎসব ক্যাম্পেইনের শর্তাবলী</h2>
            <ul className="mt-5 list-disc space-y-2 pl-6 text-[14px] font-medium leading-7 text-[#1f2937]">
              {terms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 inline bg-[#fff36b] px-2 py-1 text-[15px] font-black text-[#111827]">
              অনিবার্য কারণবশত ক্যাম্পেইনের যেকোনো পরিবর্তন, পরিবর্ধন বা পরিমার্জনের সম্পূর্ণ অধিকার JPSPARE কর্তৃপক্ষ সংরক্ষণ করে।
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
