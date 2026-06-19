"use client";

import { useCallback, useEffect, useState } from "react";

const reviews = [
  {
    category: "Suspension",
    categoryTone: "green",
    text: "Superior suspension quality with immediate performance improvement. Authentic Japanese engineering delivered with professional packaging.",
    product: "Nissan March Suspension Kit",
    vehicle: "2017 Nissan March",
    partId: "JP-MAR-SK-004",
    name: "Rashida Begum",
    role: "Rajshahi, Bangladesh - Workshop Owner",
    date: "2024-01-08",
    views: 29,
  },
  {
    category: "Engine",
    categoryTone: "red",
    text: "Exceptional customer service and reliable delivery. Premium quality parts that meet OEM standards with guaranteed authenticity.",
    product: "Toyota Allion Engine Components",
    vehicle: "2016 Toyota Allion",
    partId: "JP-ALL-EC-005",
    name: "Karim Uddin",
    role: "Khulna, Bangladesh - Automotive Technician",
    date: "2024-01-05",
    views: 41,
  },
  {
    category: "Brakes",
    categoryTone: "red",
    text: "Professional packaging and secure delivery. Every Honda Fit part fitted perfectly with no modifications needed. Outstanding quality assurance.",
    product: "Honda Fit Brake Components",
    vehicle: "2019 Honda Fit",
    partId: "JP-FIT-BC-006",
    name: "Nasir Ahmed",
    role: "Barisal, Bangladesh - Service Center Owner",
    date: "2024-01-03",
    views: 33,
    featured: true,
  },
  {
    category: "Electrical",
    categoryTone: "blue",
    text: "Fast support helped me match the exact sensor before ordering. The part arrived clean, sealed, and ready to install.",
    product: "Toyota Prius Electrical Sensor",
    vehicle: "2020 Toyota Prius",
    partId: "JP-PRI-ES-011",
    name: "Shamim Rahman",
    role: "Dhaka, Bangladesh - Car Enthusiast",
    date: "2024-01-12",
    views: 37,
  },
  {
    category: "Accessories",
    categoryTone: "green",
    text: "The accessory quality feels premium and the fitment guidance was accurate. Delivery was quick and the checkout process was simple.",
    product: "Moxom Wide-Angle Car Holder",
    vehicle: "2021 Toyota Axio",
    partId: "JP-AX-AC-014",
    name: "Mahmud Hasan",
    role: "Sylhet, Bangladesh - Daily Driver",
    date: "2024-01-15",
    views: 52,
  },
];

function ReviewIcon({ name }) {
  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="m15 18-6-6 6-6" />
      </svg>
    );
  }

  return null;
}

function ReviewCard({ review, active }) {
  const categoryClass =
    review.categoryTone === "green"
      ? "border-[#91e6c7] bg-[#e9fff7] text-[#047857]"
      : review.categoryTone === "blue"
        ? "border-[#bfdbfe] bg-[#eff6ff] text-[#155dfc]"
        : "border-[#ffb1b1] bg-[#fff0f0] text-[#c73524]";

  return (
    <article
      className={[
        "min-h-[395px] rounded-[10px] border bg-white p-4 text-left transition duration-300 max-sm:min-h-0 max-sm:p-5",
        active
          ? "min-h-[430px] border-[#f7d95f] shadow-[0_22px_52px_rgba(220,38,38,0.16)] max-xl:min-h-[395px]"
          : "border-[#dfe4ea] shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:border-[#f7d95f] hover:shadow-[0_16px_34px_rgba(220,38,38,0.10)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-9 place-items-center rounded-[8px] bg-[#fff0f0] text-[26px] font-black leading-none text-[#ef3c40]">
          ”
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.06em] ${categoryClass}`}>
          {review.category}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-[16px] leading-none text-[#ef3c40]">★★★★★</span>
        <span className="rounded-full bg-[#fff0f0] px-1.5 py-0.5 text-[11px] font-black text-[#ef3c40]">5.0</span>
      </div>

      <p className="mt-4 line-clamp-4 text-[13px] font-semibold leading-[1.55] text-[#374151]">&quot;{review.text}&quot;</p>

      <div
        className={[
          "mt-5 rounded-[8px] border bg-[#f8fafc] p-3",
          active ? "border-[#f7d95f] bg-[#fff9f0]" : "border-[#edf0f3]",
        ].join(" ")}
      >
        <p className="line-clamp-2 text-[12px] font-black leading-[1.35] text-[#111827]">
          <span className="text-[#10b981]">✓</span>
          {review.product}
        </p>
        <p className="mt-2 truncate text-[11px] font-semibold text-[#4b5563]">Vehicle: {review.vehicle}</p>
        <p className="mt-1 truncate text-[11px] font-semibold text-[#4b5563]">
          Part ID#: <span className="font-black text-[#d3191d]">{review.partId}</span>
        </p>
      </div>

      <div className="mt-5 border-t border-[#e5e7eb] pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ef3338] text-[12px] font-black text-white">
              {review.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-black text-[#111827]">
                {review.name} <span className="text-[#10b981]">✺</span>
              </p>
              <p className="line-clamp-1 text-[10px] leading-tight text-[#5b6472]">{review.role}</p>
              <p className="mt-1 text-[10px] text-[#6b7280]">{review.date}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#f3f5f8] px-2 py-1 text-[10px] font-semibold text-[#4b5563]">
            ♙ {review.views}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function CustomerReviews() {
  const visibleReviews = reviews.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(2);
  const [paused, setPaused] = useState(false);

  const goToPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + visibleReviews.length) % visibleReviews.length);
  }, [visibleReviews.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % visibleReviews.length);
  }, [visibleReviews.length]);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(goToNext, 4200);
    return () => window.clearInterval(timer);
  }, [goToNext, paused]);

  function getCardPosition(index) {
    const total = visibleReviews.length;
    const raw = (index - activeIndex + total) % total;
    return raw > Math.floor(total / 2) ? raw - total : raw;
  }

  return (
    <section id="customer-reviews" className="bg-transparent py-6 max-sm:py-4">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          CUSTOMER REVIEWS
        </div>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)] lg:p-8">
        <div className="review-coverflow" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <button type="button" onClick={goToPrevious} className="review-coverflow-control left-3" aria-label="Previous review">
            <ReviewIcon name="arrow" />
          </button>
          <button type="button" onClick={goToNext} className="review-coverflow-control review-coverflow-control-next right-3" aria-label="Next review">
            <span className="review-coverflow-control-icon-next">
              <ReviewIcon name="arrow" />
            </span>
          </button>
          <div className="review-coverflow-stage">
            {visibleReviews.map((review, index) => {
              const position = getCardPosition(index);
              return (
                <div
                  key={review.partId}
                  className={`review-coverflow-card review-coverflow-card-${position} ${position === 0 ? "review-coverflow-card-active" : ""}`}
                  aria-hidden={Math.abs(position) > 2}
                >
                  <ReviewCard review={review} active={position === 0} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-0 flex items-center justify-center gap-6 border-t border-[#eef1f5] pt-5 text-[14px] max-sm:flex-col max-sm:gap-2">
          <span className="tracking-[0.08em] text-[#ef3338]">★★★★★</span>
          <span className="font-black text-[#111827]">4.9/5</span>
          <span className="text-[#4b5563]">
            <strong className="text-[#ef3338]">Trusted by Many</strong> Happy Customers
          </span>
        </div>
      </div>
    </section>
  );
}
