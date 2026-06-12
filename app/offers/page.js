import Link from "next/link";
import OffersBestSellingClient from "./OffersBestSellingClient";
import TopDealBar from "../TopDealBar";

export const metadata = {
  title: "Offers | JPSPARE",
  description: "Latest JPSPARE offers, cashback deals, and automotive product discounts.",
};

const offers = [
  ["Eid Auto Parts Utsob", "Get amazing discounts, cashback, and free delivery on selected Japanese parts.", "13 May 2026 - 27 May 2026", "Online", "from-blue-800 via-blue-600 to-orange-500", "EID"],
  ["bKash 1000Tk Cashback Offer", "Get instant bKash cashback on online payment over eligible orders.", "05 May 2026 - 31 May 2026", "Online", "from-pink-700 via-rose-500 to-fuchsia-600", "1000"],
  ["Deep Service Kit Deal", "Enjoy discounts on essential filters, fluids, and maintenance kits.", "05 May 2026 - 31 May 2026", "All Outlet", "from-blue-900 via-sky-700 to-blue-500", "30%"],
  ["Ceiling Fan Deal", "Buy garage and workshop cooling essentials with exciting discounts.", "06 May 2026 - 31 May 2026", "Online", "from-sky-700 via-blue-600 to-yellow-400", "COOL"],
  ["Diagnostic Tool Offer", "Buy scanner and diagnostic tools with special workshop pricing.", "13 May 2026 - 31 May 2026", "All Outlet", "from-slate-900 via-cyan-700 to-blue-500", "SCAN"],
  ["Air Conditioner Deal", "Buy AC cleaner and cabin care products with free delivery.", "15 Apr 2026 - 31 May 2026", "All Outlet", "from-blue-700 via-cyan-500 to-sky-300", "AC"],
  ["Home Appliance Care Deal", "Bundle car care, microfiber, and cleaning accessories at a reduced price.", "06 May 2026 - 31 May 2026", "Online", "from-blue-800 via-indigo-600 to-cyan-500", "HOME"],
  ["Mobile Holder Deal", "Buy premium phone holders and get exciting discounts.", "07 May 2026 - 31 May 2026", "Online", "from-orange-700 via-orange-500 to-amber-400", "MOBILE"],
  ["Home Theater Sound Deal", "Upgrade your drive with speakers and audio accessories.", "06 May 2026 - 31 May 2026", "Online", "from-slate-900 via-blue-900 to-indigo-600", "AUDIO"],
  ["TV Deal", "Workshop display and garage entertainment products with discount.", "06 May 2026 - 31 May 2026", "All Outlet", "from-blue-900 via-cyan-700 to-blue-500", "TV"],
  ["Cashback Offer", "Get instant offline payment cashback on eligible JPSPARE purchases.", "13 Apr 2026 - 30 Jun 2026", "All Outlet", "from-pink-800 via-rose-500 to-red-500", "CASH"],
  ["Summer Sale Offer", "Buy smart tools, cleaners, and accessories with assured gifts.", "16 May 2026 - 31 May 2026", "All Outlet", "from-sky-200 via-white to-blue-400", "SALE"],
  ["Workshop Machine Offer", "Buy workshop tools and equipment at special seasonal pricing.", "06 May 2026 - 31 May 2026", "Online", "from-amber-100 via-orange-200 to-red-500", "TOOLS"],
  ["Monitor Offer", "Buy workshop monitor and diagnostic display packages with cashback.", "01 May 2026 - 30 Jun 2026", "Outlet", "from-purple-950 via-indigo-700 to-fuchsia-600", "DISPLAY"],
  ["Mutual Trust Bank Cashback Offer", "Buy any product and get up to 5000 Tk cashback.", "13 May 2026 - 31 May 2026", "All Outlet", "from-rose-500 via-teal-400 to-green-500", "5000"],
  ["City Bank Credit Card Cashback Offer", "Buy with City Bank card and get up to 5000 Tk cashback.", "13 May 2026 - 25 May 2026", "All Branch", "from-red-600 via-white to-slate-200", "CARD"],
  ["Logitech Offer", "Buy selected accessories and get assured gifts.", "10 May 2026 - 25 May 2026", "All Outlet", "from-cyan-400 via-sky-300 to-white", "GIFT"],
  ["Air Fryer Deal", "Buy garage and home utility products with exciting discounts.", "01 Feb 2026 - 31 May 2026", "Online", "from-slate-900 via-blue-900 to-sky-500", "20%"],
  ["Eastern Bank Eid Cashback Offer", "Buy any product and get up to 5000 Tk cashback.", "10 May 2026 - 31 May 2026", "All Branch", "from-blue-800 via-cyan-500 to-yellow-300", "5000"],
  ["MyBL Smart Summer Sale", "Shop selected parts and accessories with bonus gifts.", "15 Apr 2026 - 31 May 2026", "Online", "from-emerald-900 via-green-700 to-yellow-400", "SMART"],
  ["Blisspads Qurban Deal", "Buy selected premium accessories and get exciting discount.", "09 May 2026 - 31 May 2026", "All Outlet", "from-black via-red-900 to-orange-600", "33%"],
  ["Durag Qurban Deal", "Buy selected keyboard and utility items at exclusive prices.", "10 May 2026 - 31 May 2026", "All Outlet", "from-white via-sky-100 to-blue-500", "29%"],
];

function OfferIcon({ name, className = "size-3.5" }) {
  const paths = {
    calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
    store: "M4 10h16l-1.5-6h-13L4 10Zm2 0v10m12-10v10M9 20v-6h6v6",
    arrow: "M5 12h14m-6-6 6 6-6 6",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function OfferPoster({ title, accent, label, index }) {
  return (
    <div className={`relative aspect-[1/1.05] overflow-hidden bg-gradient-to-br ${accent} p-5 text-white`}>
      <div className="absolute -right-10 -top-12 size-36 rounded-full bg-white/18" />
      <div className="absolute -bottom-14 -left-12 size-44 rounded-full bg-black/20" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#12306c]">JPSPARE</span>
        <span className="rounded-full bg-[#ef3338] px-3 py-1 text-[10px] font-black">Offer</span>
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <p className="text-[13px] font-black uppercase tracking-[0.2em] text-white/80">Limited Deal</p>
        <h2 className="mt-3 text-[42px] font-black leading-none tracking-[-0.04em] drop-shadow-md max-sm:text-[34px]">{label}</h2>
        <p className="mt-4 max-w-[210px] text-[19px] font-black leading-tight drop-shadow">{title}</p>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-white/85">
        <span>Save more</span>
        <span>#{String(index + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

function OffersHeader() {
  return (
    <header className="sticky top-0 z-[100] bg-[#111827] text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
      <div className="mx-auto flex h-[82px] w-full max-w-[1720px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10 max-sm:h-auto max-sm:flex-wrap max-sm:py-3">
        <Link href="/" className="block h-[78px] w-[238px] shrink-0 overflow-hidden rounded-[8px] transition-transform duration-300 hover:scale-[1.02] max-lg:h-[68px] max-lg:w-[202px] max-sm:h-[60px] max-sm:w-[176px]" aria-label="JPSPARE home">
          <img src="/jpspare-logo-wide-clean.png" alt="JPSPARE" className="h-full w-full object-contain" />
        </Link>
        <nav className="flex min-w-0 flex-wrap items-center justify-end gap-3 text-[14px] font-bold max-sm:w-full max-sm:justify-start max-sm:text-[13px]">
          <Link href="/" className="rounded-[7px] px-2 py-2 transition hover:bg-white/10 hover:text-[#f7d95f]">Home</Link>
          <Link href="/products" className="rounded-[7px] px-2 py-2 transition hover:bg-white/10 hover:text-[#f7d95f]">Products</Link>
          <Link href="/offers" className="rounded-[7px] bg-[#ef3338] px-3 py-2 text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)]">Offers</Link>
          <Link href="/track-order" className="rounded-[9px] bg-white px-4 py-2 font-black text-[#111827] transition hover:bg-[#fff2f2]">Track Order</Link>
        </nav>
      </div>
    </header>
  );
}

export default function OffersPage() {
  return (
    <>
      <TopDealBar />
      <OffersHeader />
      <main className="bg-[#eef0f5] text-[#111827]">
        <OffersBestSellingClient />

        <section className="mx-auto w-full max-w-[1180px] px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-x-9 gap-y-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {offers.map(([title, description, date, channel, accent, label], index) => (
              <article key={`${title}-${date}`} className="bg-white shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.13)]">
                <OfferPoster title={title} accent={accent} label={label} index={index} />
                <div className="px-4 pb-5 pt-3 text-center">
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#edf0f4] pb-2 text-[10px] font-semibold text-[#4b5563]">
                    <span className="inline-flex items-center gap-1">
                      <OfferIcon name="calendar" />
                      {date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <OfferIcon name="store" />
                      {channel}
                    </span>
                  </div>
                  <h2 className="text-[15px] font-black leading-5 text-[#1f2937]">{title}</h2>
                  <p className="mt-2 min-h-10 text-[11px] font-medium leading-5 text-[#6b7280]">{description}</p>
                  <Link href="/sale-offer" className="mt-4 inline-flex h-9 items-center justify-center rounded-[3px] bg-[#174bbd] px-5 text-[11px] font-black text-white transition hover:bg-[#ef3338]">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
