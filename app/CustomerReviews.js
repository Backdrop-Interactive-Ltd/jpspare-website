"use client";

import { useState } from "react";

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
        "min-h-[514px] rounded-[12px] border bg-white p-8 text-left transition duration-300 max-sm:min-h-0 max-sm:p-6",
        active
          ? "border-[#f7d95f] shadow-[0_18px_42px_rgba(220,38,38,0.12)]"
          : "border-[#dfe4ea] shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:border-[#f7d95f] hover:shadow-[0_16px_34px_rgba(220,38,38,0.10)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-[10px] bg-[#fff0f0] text-[34px] font-black leading-none text-[#ef3c40]">
          ”
        </span>
        <span className={`rounded-full border px-4 py-1.5 text-[12px] font-black uppercase tracking-[0.08em] ${categoryClass}`}>
          {review.category}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span className="text-[22px] leading-none text-[#ef3c40]">★★★★★</span>
        <span className="rounded-full bg-[#fff0f0] px-2 py-1 text-[13px] font-black text-[#ef3c40]">5.0</span>
      </div>

      <p className="mt-6 text-[17px] leading-[1.55] text-[#374151]">&quot;{review.text}&quot;</p>

      <div
        className={[
          "mt-7 rounded-[8px] border bg-[#f8fafc] p-5",
          active ? "border-[#f7d95f] bg-[#fff9f0]" : "border-[#edf0f3]",
        ].join(" ")}
      >
        <p className="flex items-center gap-2 text-[14px] font-black text-[#111827]">
          <span className="text-[#10b981]">✓</span>
          {review.product}
        </p>
        <p className="mt-3 text-[14px] text-[#4b5563]">Vehicle: {review.vehicle}</p>
        <p className="mt-2 text-[14px] text-[#4b5563]">
          Part ID#: <span className="font-black text-[#d3191d]">{review.partId}</span>
        </p>
      </div>

      <div className="mt-7 border-t border-[#e5e7eb] pt-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ef3338] text-[14px] font-black text-white">
              {review.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-black text-[#111827]">
                {review.name} <span className="text-[#10b981]">✺</span>
              </p>
              <p className="text-[12px] leading-tight text-[#5b6472]">{review.role}</p>
              <p className="mt-1 text-[12px] text-[#6b7280]">{review.date}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#f3f5f8] px-3 py-1.5 text-[12px] font-semibold text-[#4b5563]">
            ♙ {review.views}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function CustomerReviews() {
  const [start, setStart] = useState(0);
  const visibleReviews = [0, 1, 2].map((offset) => reviews[(start + offset) % reviews.length]);

  const next = () => setStart((current) => (current + 1) % reviews.length);
  const prev = () => setStart((current) => (current - 1 + reviews.length) % reviews.length);

  return (
    <section id="customer-reviews" className="bg-white py-24 max-sm:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
        <div className="inline-flex h-[48px] items-center gap-3 rounded-full border border-[#f7d95f] bg-[#fff8f8] px-7 text-[14px] font-black uppercase tracking-[0.08em] text-[#d3191d]">
          <ReviewIcon name="shield" />
          Customer Reviews
        </div>

        <h2 className="mt-10 text-[48px] font-black leading-tight tracking-[-0.04em] text-[#111827] max-md:text-[40px] max-sm:text-[32px]">
          Trusted by Car Enthusiasts Worldwide
        </h2>
        <span className="mx-auto mt-8 block h-1 w-24 rounded-full bg-[#ef3338]" />

        <div className="mt-16 grid grid-cols-3 gap-8 max-lg:grid-cols-1">
          {visibleReviews.map((review, index) => (
            <ReviewCard key={`${review.partId}-${start}`} review={review} active={index === 2} />
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            className="grid size-12 place-items-center rounded-full border-2 border-[#ef3338] text-[#ef3338] transition hover:bg-[#ef3338] hover:text-white"
            aria-label="Previous review"
          >
            <ReviewIcon name="arrow" />
          </button>
          <button
            type="button"
            onClick={next}
            className="grid size-12 place-items-center rounded-full border-2 border-[#ef3338] text-[#ef3338] transition hover:bg-[#ef3338] hover:text-white"
            aria-label="Next review"
          >
            <span className="rotate-180">
              <ReviewIcon name="arrow" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
