"use client";

import { useEffect, useMemo, useState } from "react";

function SlideButton({ direction, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-[34px] z-10 grid size-7 place-items-center rounded-full border border-[#e5e9ef] bg-white/95 text-[#111827] shadow-[0_7px_16px_rgba(15,23,42,0.12)] transition hover:border-[#f7d95f] hover:bg-[#ef3338] hover:text-white ${direction === "left" ? "left-0" : "right-0"}`}
    >
      <svg className="size-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === "left" ? <path d="M7.5 2 3.5 6l4 4" /> : <path d="m4.5 2 4 4-4 4" />}
      </svg>
    </button>
  );
}

export default function AccessoryRecommendationScroller({ items, visibleCount = 6 }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / visibleCount));
  const visibleItems = useMemo(() => {
    const start = page * visibleCount;
    const current = items.slice(start, start + visibleCount);
    if (current.length >= visibleCount || !items.length) return current;
    return [...current, ...items.slice(0, visibleCount - current.length)];
  }, [items, page, visibleCount]);

  function slide(direction) {
    setDirection(direction);
    setPage((current) => (current + direction + pageCount) % pageCount);
  }

  useEffect(() => {
    if (items.length <= visibleCount) return undefined;
    const timer = window.setInterval(() => slide(1), 5000);
    return () => window.clearInterval(timer);
  }, [items.length, visibleCount]);

  return (
    <div className="relative">
      <SlideButton direction="left" label="Show previous recommended items" onClick={() => slide(-1)} />
      <div
        key={`${page}-${direction}`}
        className="dropdown-carousel-slide grid grid-cols-6 gap-2 px-8"
        style={{ "--dropdown-slide-x": direction > 0 ? "18px" : "-18px" }}
      >
        {visibleItems.map((item, index) => (
          <a
            key={item.label}
            href={`/products?q=${encodeURIComponent(item.query)}`}
            className="dropdown-carousel-item group/recommended min-w-0 text-center"
            style={{
              "--dropdown-item-index": index,
              "--dropdown-slide-x": direction > 0 ? "18px" : "-18px",
            }}
          >
            <span className="block h-[64px] overflow-hidden bg-white">
              <img
                src={item.image}
                alt=""
                className="h-full w-full object-contain transition duration-300 group-hover/recommended:scale-[1.06]"
              />
            </span>
            <span className="mt-1 block truncate text-[10px] font-black leading-[1.2] text-[#334155] transition group-hover/recommended:text-[#ef3338]">{item.label}</span>
          </a>
        ))}
      </div>
      <SlideButton direction="right" label="Show more recommended items" onClick={() => slide(1)} />
    </div>
  );
}
