"use client";

import { useEffect, useMemo, useState } from "react";

const demoAccessoryBrands = [
  { id: "demo-flamingo", name: "Flamingo", slug: "flamingo", mark: "Flamingo", tone: "bg-[#e91e63] text-white" },
  { id: "demo-moxom", name: "MOXOM", slug: "moxom", mark: "MOXOM", tone: "bg-[#111827] text-white" },
  { id: "demo-yesido", name: "Yesido", slug: "yesido", mark: "YESIDO", tone: "bg-[#f7d95f] text-[#111827]" },
  { id: "demo-joyroom", name: "Joyroom", slug: "joyroom", mark: "JOYROOM", tone: "bg-[#2563eb] text-white" },
  { id: "demo-kangaroo", name: "Kangaroo", slug: "kangaroo", mark: "KANGAROO", tone: "bg-[#ff7a1a] text-white" },
  { id: "demo-philips", name: "Philips", slug: "philips", mark: "PHILIPS", tone: "bg-[#1554a3] text-white" },
  { id: "demo-liqui-moly", name: "Liqui Moly", slug: "liqui-moly", mark: "LIQUI MOLY", tone: "bg-[#e12526] text-white" },
  { id: "demo-3m", name: "3M", slug: "3m", mark: "3M", tone: "bg-[#f4f4f5] text-[#e12526]" },
  { id: "demo-soft99", name: "SOFT99", slug: "soft99", mark: "SOFT99", tone: "bg-[#111827] text-white" },
  { id: "demo-bullson", name: "Bullson", slug: "bullson", mark: "Bullson", tone: "bg-[#ef3338] text-white" },
  { id: "demo-mobil", name: "Mobil 1", slug: "mobil-1", mark: "Mobil 1", tone: "bg-white text-[#1554a3] ring-1 ring-[#e5e7eb]" },
  { id: "demo-chevron", name: "Chevron", slug: "chevron", mark: "CHEVRON", tone: "bg-[#1d4ed8] text-white" },
];

const demoBrandSets = {
  "car-accessories": demoAccessoryBrands,
  "car-parts": [
    { id: "parts-denso", name: "DENSO", slug: "denso", mark: "DENSO", tone: "bg-[#ef3338] text-white" },
    { id: "parts-brembo", name: "Brembo", slug: "brembo", mark: "brembo", tone: "bg-[#e12526] text-white" },
    { id: "parts-akebono", name: "AKEBONO", slug: "akebono", mark: "AKEBONO", tone: "bg-white text-[#2270a8] ring-1 ring-[#dfe4ea]" },
    { id: "parts-advics", name: "Advics", slug: "advics", mark: "ADVICS", tone: "bg-white text-[#24436b] ring-1 ring-[#dfe4ea]" },
    { id: "parts-japanparts", name: "Japanparts", slug: "japanparts", mark: "JAPANPARTS", tone: "bg-[#111827] text-white" },
    { id: "parts-ngk", name: "NGK", slug: "ngk", mark: "NGK", tone: "bg-[#f4f4f5] text-[#ef3338]" },
    { id: "parts-bosch", name: "Bosch", slug: "bosch", mark: "BOSCH", tone: "bg-[#e12526] text-white" },
    { id: "parts-toyota", name: "Toyota", slug: "toyota", mark: "TOYOTA", tone: "bg-white text-[#ef3338] ring-1 ring-[#dfe4ea]" },
    { id: "parts-honda", name: "Honda", slug: "honda", mark: "HONDA", tone: "bg-[#ef3338] text-white" },
    { id: "parts-nissan", name: "Nissan", slug: "nissan", mark: "NISSAN", tone: "bg-[#111827] text-white" },
    { id: "parts-mitsubishi", name: "Mitsubishi", slug: "mitsubishi", mark: "MITSUBISHI", tone: "bg-white text-[#ef3338] ring-1 ring-[#dfe4ea]" },
    { id: "parts-subaru", name: "Subaru", slug: "subaru", mark: "SUBARU", tone: "bg-[#1554a3] text-white" },
  ],
  tyres: [
    { id: "tyre-yokohama", name: "Yokohama", slug: "yokohama", mark: "YOKOHAMA", tone: "bg-[#ef3338] text-white" },
    { id: "tyre-bridgestone", name: "Bridgestone", slug: "bridgestone", mark: "BRIDGESTONE", tone: "bg-[#111827] text-white" },
    { id: "tyre-pirelli", name: "Pirelli", slug: "pirelli", mark: "PIRELLI", tone: "bg-[#f7d95f] text-[#111827]" },
    { id: "tyre-michelin", name: "Michelin", slug: "michelin", mark: "MICHELIN", tone: "bg-[#1554a3] text-white" },
    { id: "tyre-goodyear", name: "Goodyear", slug: "goodyear", mark: "GOODYEAR", tone: "bg-[#0f3f8f] text-white" },
    { id: "tyre-dunlop", name: "Dunlop", slug: "dunlop", mark: "DUNLOP", tone: "bg-[#f7d95f] text-[#111827]" },
    { id: "tyre-maxxis", name: "Maxxis", slug: "maxxis", mark: "MAXXIS", tone: "bg-[#ef3338] text-white" },
    { id: "tyre-continental", name: "Continental", slug: "continental", mark: "CONTINENTAL", tone: "bg-[#f7d95f] text-[#111827]" },
    { id: "tyre-hankook", name: "Hankook", slug: "hankook", mark: "HANKOOK", tone: "bg-[#ff7a1a] text-white" },
    { id: "tyre-toyo", name: "Toyo", slug: "toyo", mark: "TOYO", tone: "bg-[#1554a3] text-white" },
    { id: "tyre-falken", name: "Falken", slug: "falken", mark: "FALKEN", tone: "bg-[#111827] text-white" },
    { id: "tyre-nitto", name: "Nitto", slug: "nitto", mark: "NITTO", tone: "bg-white text-[#ef3338] ring-1 ring-[#dfe4ea]" },
  ],
  lubricant: [
    { id: "lube-elf", name: "ELF", slug: "elf", mark: "ELF", tone: "bg-[#1554a3] text-white" },
    { id: "lube-shell", name: "Shell", slug: "shell", mark: "SHELL", tone: "bg-[#f7d95f] text-[#ef3338]" },
    { id: "lube-mobil", name: "Mobil 1", slug: "mobil-1", mark: "Mobil 1", tone: "bg-white text-[#1554a3] ring-1 ring-[#dfe4ea]" },
    { id: "lube-liqui-moly", name: "Liqui Moly", slug: "liqui-moly", mark: "LIQUI MOLY", tone: "bg-[#e12526] text-white" },
    { id: "lube-ravenol", name: "Ravenol", slug: "ravenol", mark: "RAVENOL", tone: "bg-[#0f172a] text-white" },
    { id: "lube-totachi", name: "Totachi", slug: "totachi", mark: "TOTACHI", tone: "bg-[#ef3338] text-white" },
    { id: "lube-idemitsu", name: "Idemitsu", slug: "idemitsu", mark: "IDEMITSU", tone: "bg-white text-[#ef3338] ring-1 ring-[#dfe4ea]" },
    { id: "lube-motul", name: "Motul", slug: "motul", mark: "MOTUL", tone: "bg-[#ef3338] text-white" },
    { id: "lube-castrol", name: "Castrol", slug: "castrol", mark: "CASTROL", tone: "bg-[#15803d] text-white" },
    { id: "lube-valvoline", name: "Valvoline", slug: "valvoline", mark: "VALVOLINE", tone: "bg-[#1554a3] text-white" },
    { id: "lube-bizol", name: "Bizol", slug: "bizol", mark: "BIZOL", tone: "bg-[#f7d95f] text-[#111827]" },
    { id: "lube-eneos", name: "ENEOS", slug: "eneos", mark: "ENEOS", tone: "bg-[#ef3338] text-white" },
  ],
};

function SlideButton({ direction, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-[35px] z-10 grid size-7 place-items-center rounded-full border border-[#e5e9ef] bg-white/95 text-[#111827] shadow-[0_7px_16px_rgba(15,23,42,0.12)] transition hover:border-[#f7d95f] hover:bg-[#ef3338] hover:text-white ${direction === "left" ? "left-0" : "right-0"}`}
    >
      <svg className="size-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === "left" ? <path d="M7.5 2 3.5 6l4 4" /> : <path d="m4.5 2 4 4-4 4" />}
      </svg>
    </button>
  );
}

function BrandTile({ brand, logoSize = 54, index = 0, direction = 1 }) {
  const initials = brand.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <a
      href={`/products?brand=${encodeURIComponent(brand.slug)}`}
      className="dropdown-carousel-item group/brand min-w-0 text-center"
      style={{
        "--dropdown-item-index": index,
        "--dropdown-slide-x": direction > 0 ? "18px" : "-18px",
      }}
    >
      <span
        className="mx-auto grid place-items-center overflow-hidden rounded-full border border-[#dfe4ea] bg-white p-1.5 shadow-[0_3px_12px_rgba(15,23,42,0.04)] transition duration-300 group-hover/brand:border-[#f7d95f] group-hover/brand:shadow-[0_10px_22px_rgba(220,38,38,0.10)]"
        style={{ width: logoSize, height: logoSize }}
      >
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.name} className="h-full w-full rounded-full object-contain transition duration-300 group-hover/brand:scale-[1.06]" />
        ) : (
          <span className={`grid size-full place-items-center rounded-full px-2 text-center text-[10px] font-black leading-tight transition duration-300 group-hover/brand:scale-[1.06] ${brand.tone || "bg-[#111827] text-white"}`}>
            {brand.mark || initials}
          </span>
        )}
      </span>
      <span className="mt-1 block truncate text-[10px] font-black text-[#334155] transition group-hover/brand:text-[#ef3338]">{brand.name}</span>
    </a>
  );
}

export default function CategoryBrandRecommendations({ category, limit = 12, columns = 12, logoSize = 54, scrollable = false, visibleCount = 6 }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

  function slide(direction) {
    const pageCount = Math.max(1, Math.ceil(visibleBrands.length / visibleCount));
    setDirection(direction);
    setPage((current) => (current + direction + pageCount) % pageCount);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadBrands() {
      try {
        const response = await fetch(`/api/navigation/brands?category=${encodeURIComponent(category)}&limit=${limit}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (response.ok) setBrands(payload.items || []);
      } catch (error) {
        if (error.name !== "AbortError") setBrands([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadBrands();
    return () => controller.abort();
  }, [category, limit]);

  const fallbackBrands = demoBrandSets[category] || demoAccessoryBrands;
  const visibleBrands = (brands.length ? brands : fallbackBrands).slice(0, limit);
  const pageCount = Math.max(1, Math.ceil(visibleBrands.length / visibleCount));
  const carouselBrands = useMemo(() => {
    const start = page * visibleCount;
    const current = visibleBrands.slice(start, start + visibleCount);
    if (current.length >= visibleCount || !visibleBrands.length) return current;
    return [...current, ...visibleBrands.slice(0, visibleCount - current.length)];
  }, [visibleBrands, page, visibleCount]);

  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [page, pageCount]);

  useEffect(() => {
    if (!scrollable || loading || visibleBrands.length <= visibleCount) return undefined;
    const timer = window.setInterval(() => slide(1), 2800);
    return () => window.clearInterval(timer);
  }, [scrollable, loading, visibleBrands.length, visibleCount]);

  if (loading) {
    return (
      <div className="grid gap-3" style={gridStyle} aria-label="Loading accessory brands">
        {Array.from({ length: limit }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="mx-auto rounded-full bg-[#eef1f5]" style={{ width: logoSize, height: logoSize }} />
            <div className="mx-auto mt-1 h-2.5 w-3/4 rounded bg-[#eef1f5]" />
          </div>
        ))}
      </div>
    );
  }

  if (scrollable) {
    return (
      <div className="relative">
        <SlideButton direction="left" label="Show previous brands" onClick={() => slide(-1)} />
        <div
          key={`${page}-${direction}`}
          className="dropdown-carousel-slide grid gap-2 px-8"
          style={{
            gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))`,
            "--dropdown-slide-x": direction > 0 ? "18px" : "-18px",
          }}
        >
          {carouselBrands.map((brand, index) => (
            <BrandTile key={brand.id} brand={brand} logoSize={logoSize} index={index} direction={direction} />
          ))}
        </div>
        <SlideButton direction="right" label="Show more brands" onClick={() => slide(1)} />
      </div>
    );
  }

  return (
    <div className="grid gap-3" style={gridStyle}>
      {visibleBrands.map((brand) => (
        <BrandTile key={brand.id} brand={brand} logoSize={logoSize} />
      ))}
    </div>
  );
}
