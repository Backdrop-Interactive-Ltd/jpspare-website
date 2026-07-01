"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { addProductToCart, addProductToWishlist } from "../../commerce-client";
import { formatPriceDisplay } from "../../price-format";
import { ProductCardInfo } from "../../ProductTabs";
import ProductQuickActions from "../../ProductQuickActions";

const fallbackProduct = {
  title: "Liqui Moly Octane Booster - 200mL",
  price: "Tk 850.00",
  slug: "liqui-moly-octane-booster-200ml",
};

const productCopy = {
  "liqui-moly-octane-booster-200ml": fallbackProduct,
};

const relatedProducts = [
  { category: "ADDITIVES FLUID", name: "Chevron Techron Fuel System Cleaner (USA) - 355mL", price: "Tk 1,650.00", reviews: 2, crop: "bg-[-968px_-28px]" },
  { category: "ADDITIVES FLUID", name: "Liqui Moly Engine Flush Plus - 300mL", price: "Tk 850.00", reviews: 5, crop: "bg-[-1318px_-37px]" },
  { category: "LUBRICANT", name: "Liqui Moly Hybrid Additive - 250 mL", price: "Tk 899.00", reviews: 3, crop: "bg-[-268px_-22px]" },
  { category: "FUEL SYSTEM", name: "Dipetane Fuel System Cleaner & Treatment - 277mL", price: "Tk 1,199.00", reviews: 4, crop: "bg-[-618px_-28px]" },
];

const buyingNowProducts = [
  { category: "CAR CARE DETAILING", name: "Auto Windshield Washer Glass Cleaner Tablet", price: "Tk 299.00", reviews: 3, crop: "bg-[-268px_-22px]" },
  { category: "FUEL SYSTEM", name: "Dipetane Fuel System Cleaner & Treatment", price: "Tk 1,199.00", reviews: 7, crop: "bg-[-618px_-28px]" },
  { category: "CAR ACCESSORIES", name: "Premium Microfiber Cleaning Towel", price: "Tk 450.00", reviews: 5, crop: "bg-[-618px_-506px]" },
  { category: "CAR CARE", name: "Exterior Shine Quick Detailer Spray", price: "Tk 750.00", reviews: 6, crop: "bg-[-268px_-507px]" },
  { category: "ADDITIVES FLUID", name: "Liqui Moly Engine Flush Plus", price: "Tk 850.00", reviews: 2, crop: "bg-[-1318px_-37px]" },
];

const reviewStats = [
  { rating: 5, count: 3 },
  { rating: 4, count: 0 },
  { rating: 3, count: 0 },
  { rating: 2, count: 0 },
  { rating: 1, count: 0 },
];

const productReviews = [
  {
    name: "Abdullaah sayeed",
    date: "02/25/2026",
    initial: "A",
    text: "Using form last 3 years much better than typical washer fluid. Very to use highly effective guys 👌",
    image: "/black-odor-red-front.webp",
  },
  {
    name: "Musa",
    date: "02/07/2026",
    initial: "M",
    text: "Awesome 🔥 Guys you can see the results it's hard to notice the windshield",
    image: "/black-odor-green-console.jpg",
  },
  {
    name: "Rakib Hasan",
    date: "01/18/2026",
    initial: "R",
    text: "Good quality product and delivery was fast. Packaging looked premium.",
    image: "/black-odor-promo.webp",
  },
];

const gallerySlides = [
  { label: "Black Odor Red", src: "/black-odor-red-front.webp" },
  { label: "Black Odor Amber", src: "/black-odor-amber-front.webp" },
  { label: "Black Odor Blue Console", src: "/black-odor-blue-console.webp" },
  { label: "Black Odor Red Console", src: "/black-odor-red-console.webp" },
  { label: "Black Odor Green Console", src: "/black-odor-green-console.jpg" },
  { label: "Black Odor Promo", src: "/black-odor-promo.webp" },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ZoomPlusIcon({ className = "size-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.75" stroke="currentColor" strokeWidth="2" />
      <path d="M10.5 7.25v6.5M7.25 10.5h6.5M15.5 15.5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProductGallery() {
  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomPoint, setZoomPoint] = useState({ x: 50, y: 50 });
  const current = gallerySlides[active];
  const resetZoom = () => {
    setIsZoomed(false);
    setZoomPoint({ x: 50, y: 50 });
  };
  const move = (step) => {
    resetZoom();
    setLightboxScale(1);
    setActive((active + step + gallerySlides.length) % gallerySlides.length);
  };
  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPoint({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };
  const selectSlide = (index) => {
    resetZoom();
    setLightboxScale(1);
    setActive(index);
  };
  const openLightbox = (index) => {
    selectSlide(index);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    if (!isPlaying || !isLightboxOpen) return undefined;
    const timer = setInterval(() => {
      setLightboxScale(1);
      setActive((value) => (value + 1) % gallerySlides.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [isPlaying, isLightboxOpen]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[14px] font-semibold text-[#7b8794]">
        <Link href="/" className="transition hover:text-[#d3191d]">Home</Link>
        <span>›</span>
        <button className="transition hover:text-[#d3191d]">Perfume &amp; Showpiece</button>
        <span>›</span>
        <span className="truncate text-[#7b8794]">Black Odor BO-41 Premium...</span>
      </div>
      <button
        type="button"
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsZoomed(false);
        }}
        onMouseMove={handlePointerMove}
        className="group relative block aspect-square w-full cursor-none overflow-hidden bg-[#f5f5f5] text-left max-sm:cursor-zoom-in"
        aria-label={isZoomed ? "Close image zoom" : "Zoom product image"}
      >
        <Image
          src={current.src}
          alt={current.label}
          fill
          sizes="(max-width: 1024px) 100vw, 520px"
          priority={active === 0}
          className="object-cover transition-transform duration-300"
          style={{
            transform: isZoomed ? "scale(2.25)" : "scale(1)",
            transformOrigin: `${zoomPoint.x}% ${zoomPoint.y}%`,
          }}
        />
        <span
          className={`pointer-events-none absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center text-[#111827] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] transition-opacity ${isHovering && !isZoomed ? "opacity-100" : "opacity-0"}`}
          style={{ left: `${zoomPoint.x}%`, top: `${zoomPoint.y}%` }}
        >
          <ZoomPlusIcon />
        </span>
        {isZoomed && (
          <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/70 px-4 py-2 text-[12px] font-black text-white">
            Move cursor to inspect
          </span>
        )}
      </button>
      <div className="pointer-events-none relative -mt-[100%] aspect-square">
        <button
          type="button"
          onClick={() => move(-1)}
          className="pointer-events-auto absolute left-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[25px] leading-none text-[#4b5563] shadow transition hover:bg-[#d3191d] hover:text-white"
          aria-label="Previous product image"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          className="pointer-events-auto absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[25px] leading-none text-[#4b5563] shadow transition hover:bg-[#d3191d] hover:text-white"
          aria-label="Next product image"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="pointer-events-auto absolute bottom-3 right-3 grid size-9 place-items-center rounded-[5px] border border-[#d1d5db] bg-white text-[18px] text-[#111827] shadow-sm transition hover:border-[#d3191d] hover:text-[#d3191d]"
          aria-label="Zoom product image"
        >
          <ZoomPlusIcon className="size-5" />
        </button>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 max-sm:gap-2">
        {gallerySlides.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => openLightbox(index)}
            className={`h-[84px] w-[84px] shrink-0 border bg-white p-1 transition max-sm:size-[68px] ${active === index ? "border-[#d3191d] shadow-[0_8px_18px_rgba(211,25,29,0.18)]" : "border-[#d1d5db] hover:border-[#d3191d]"}`}
            aria-label={`Show ${item.label}`}
          >
            <span className="relative block h-full w-full overflow-hidden">
              <Image src={item.src} alt="" fill sizes="84px" className="object-cover" />
            </span>
          </button>
        ))}
      </div>
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black text-white">
          <div className="absolute right-4 top-4 z-10 flex items-center gap-5 text-white/80 max-sm:right-3 max-sm:gap-4">
            <button type="button" onClick={() => setLightboxScale((value) => Math.min(2.4, value + 0.25))} className="transition hover:text-white" aria-label="Zoom in">
              <ZoomPlusIcon className="size-6" />
            </button>
            <button type="button" onClick={() => setLightboxScale((value) => Math.max(1, value - 0.25))} className="text-[30px] leading-none transition hover:text-white" aria-label="Zoom out">
              ⌕
            </button>
            <button type="button" onClick={() => setIsPlaying(!isPlaying)} className="text-[25px] leading-none transition hover:text-white" aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}>
              {isPlaying ? "Ⅱ" : "▶"}
            </button>
            <button type="button" onClick={() => { setIsLightboxOpen(false); setIsPlaying(false); setLightboxScale(1); }} className="text-[42px] leading-none transition hover:text-white" aria-label="Close gallery">
              ×
            </button>
          </div>
          <button type="button" onClick={() => move(-1)} className="absolute left-6 top-1/2 z-10 -translate-y-1/2 text-[48px] leading-none text-white/80 transition hover:text-white max-sm:left-3 max-sm:text-[38px]" aria-label="Previous image">‹</button>
          <button type="button" onClick={() => move(1)} className="absolute right-6 top-1/2 z-10 -translate-y-1/2 text-[48px] leading-none text-white/80 transition hover:text-white max-sm:right-3 max-sm:text-[38px]" aria-label="Next image">›</button>
          <div className="mx-auto flex h-[calc(100vh-130px)] max-w-[860px] items-center justify-center px-8 pt-4 max-sm:h-[calc(100vh-112px)] max-sm:px-4">
            <div className="relative h-full max-h-[820px] w-full overflow-hidden">
              <Image
                src={current.src}
                alt={current.label}
                fill
                sizes="100vw"
                className="object-contain transition-transform duration-300"
                style={{ transform: `scale(${lightboxScale})` }}
              />
            </div>
          </div>
          <div className="absolute bottom-7 left-1/2 flex max-w-full -translate-x-1/2 gap-4 overflow-x-auto px-5 max-sm:bottom-4 max-sm:gap-2">
            {gallerySlides.map((item, index) => (
              <button
                key={`lightbox-${item.label}`}
                type="button"
                onClick={() => selectSlide(index)}
                className={`relative h-[88px] w-[130px] shrink-0 overflow-hidden rounded-[3px] border bg-black transition max-sm:h-[64px] max-sm:w-[86px] ${active === index ? "border-white" : "border-white/50 hover:border-white"}`}
                aria-label={`Open ${item.label}`}
              >
                <Image src={item.src} alt="" fill sizes="130px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const productInfoTabs = [
  { label: "Description", icon: "▤", target: "product-description" },
  { label: "Specs", icon: "▣", target: "product-specs" },
  { label: "Compatibility", icon: "⌁", target: "product-compatibility" },
  { label: "Reviews", icon: "□", target: "product-reviews" },
];

function ProductInfoTabs({ activeTab, setActiveTab }) {
  const goToSection = (tab) => {
    setActiveTab(tab.label);
    requestAnimationFrame(() => {
      document.getElementById(tab.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="mx-auto mt-14 max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 max-sm:mt-8 max-sm:px-4">
      <div className="flex items-end gap-7 overflow-x-auto border-b border-[#d6dbe3] text-[14px] font-black text-[#4b5563] max-sm:gap-3">
        {productInfoTabs.map((tab) => {
          const isActive = activeTab === tab.label;

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => goToSection(tab)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-t-[10px] px-5 transition max-sm:px-4 max-sm:text-[13px] ${
                isActive
                  ? "border-b-2 border-[#ed1f24] bg-[#fff8f8] text-[#ed1f24]"
                  : "border-b-2 border-transparent hover:bg-[#fff8f8] hover:text-[#ed1f24]"
              }`}
            >
              <span className="text-[16px] leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StarRow({ className = "" }) {
  return <div className={`tracking-[0.08em] text-[#0f8f83] ${className}`}>★★★★★</div>;
}

function ProductReviews() {
  return (
    <section id="product-reviews" className="scroll-mt-24 bg-white px-5 py-20 max-sm:px-4 max-sm:py-12">
      <div className="mx-auto grid max-w-[1140px] grid-cols-[300px_1fr] gap-10 max-lg:grid-cols-1">
        <aside>
          <h2 className="text-[24px] font-medium tracking-[-0.01em]">Customer Reviews</h2>
          <p className="mt-3 text-[14px]">
            <span className="mr-2 text-[22px] font-black">5.0</span>
            3 reviews
          </p>
          <button className="mt-7 h-[34px] w-full rounded-[7px] bg-[#168b78] text-[16px] font-black text-white transition hover:bg-[#0f7667]">
            Write a review
          </button>
          <div className="mt-7 space-y-4">
            {reviewStats.map((row) => (
              <div key={row.rating} className="grid grid-cols-[24px_14px_1fr_24px] items-center gap-2 text-[16px] text-[#111827]">
                <span>{row.rating}</span>
                <span className="text-[#0f8f83]">★</span>
                <span className="h-px bg-[#d7ebe7]">
                  <span className={`block h-px bg-[#0f8f83] ${row.count ? "w-full" : "w-0"}`} />
                </span>
                <span className="text-right text-[#6b7280]">{row.count}</span>
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className="mb-8 flex justify-end gap-2 max-sm:justify-start">
            <button className="grid size-9 place-items-center rounded-[7px] border border-black text-[16px] transition hover:bg-black hover:text-white" aria-label="Filter reviews">
              ▽
            </button>
            <select className="h-9 rounded-[7px] border border-black bg-white px-3 text-[13px] font-black outline-none">
              <option>Most recent</option>
              <option>Highest rating</option>
              <option>With photos</option>
            </select>
          </div>

          <div className="space-y-10">
            {productReviews.map((review) => (
              <article key={review.name} className="border-b border-[#d1d5db] pb-10 last:border-b-0">
                <StarRow className="text-[30px] leading-none max-sm:text-[24px]" />
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-[#eaf2f0] text-[16px] font-black">{review.initial}</span>
                  <div>
                    <h3 className="text-[17px] font-black">{review.name}</h3>
                    <p className="text-[15px] text-[#6b7280]">{review.date}</p>
                  </div>
                </div>
                <p className="mt-6 text-[17px] leading-7 text-black max-sm:text-[15px]">{review.text}</p>
                <div className="relative mt-5 h-40 w-40 overflow-hidden rounded-[7px] max-sm:size-32">
                  <Image src={review.image} alt={`${review.name} review photo`} fill sizes="160px" className="object-cover" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecsPanel() {
  return (
    <section id="product-specs" className="scroll-mt-24 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 max-sm:px-4">
      <div className="rounded-[14px] border border-[#f7d95f] bg-[#fffafa] px-8 py-9 shadow-[0_14px_28px_rgba(220,38,38,0.06)] max-sm:px-5 max-sm:py-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[8px] bg-[#ef3338] text-[20px] text-white shadow-[0_10px_18px_rgba(239,51,56,0.25)]">⚙</span>
          <h2 className="text-[25px] font-black tracking-[-0.03em] text-[#111827] max-sm:text-[21px]">Product Specifications</h2>
        </div>

        <div className="mt-11 flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-[#ef3338]" />
          <h3 className="text-[18px] font-black uppercase tracking-[0.08em] text-[#111827]">Basic Information</h3>
        </div>

        <div className="mt-6 grid max-w-[762px] grid-cols-2 gap-4 max-md:grid-cols-1">
          {[
            { label: "Brand", value: "DENSO", icon: "♙", tone: "red" },
            { label: "Part Number", value: "7633670799616", icon: "⚙", tone: "blue" },
          ].map((item) => (
            <div key={item.label} className={`min-h-[126px] rounded-[10px] border bg-white/70 p-6 ${item.tone === "blue" ? "border-[#f7d95f] bg-[#fff7f7]" : "border-[#e5e7eb]"}`}>
              <div className="flex items-center gap-3">
                <span className={`grid size-6 place-items-center rounded-[7px] text-[14px] ${item.tone === "blue" ? "bg-[#dbeafe] text-[#2f74f3]" : "bg-[#ffe7e7] text-[#ef3338]"}`}>{item.icon}</span>
                <h4 className="text-[14px] font-black uppercase tracking-[0.08em] text-[#111827]">{item.label}</h4>
              </div>
              <p className="mt-6 text-[16px] text-[#374151]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompatibilityPanel() {
  const vehicles = [
    { vehicle: "Toyota Hiace", detail: "Toyota Hiace 2015-2024 - TRH200V", start: "2015", end: "2024", engine: "2000cc", chassis: "TRH200V" },
    { vehicle: "Toyota Hiace", detail: "Toyota Hiace 2010-2015 - TRH200K", start: "2010", end: "2015", engine: "2000cc", chassis: "TRH200K", highlight: true },
    { vehicle: "Toyota Hiace", detail: "Toyota Hiace (2015+) - TRH200K", start: "2015", end: "2025", engine: "2000cc", chassis: "TRH200K" },
  ];

  return (
    <section id="product-compatibility" className="scroll-mt-24 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 py-9 max-sm:px-4">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-[#fff0f0] text-[24px] text-[#ed1f24]">▤</span>
        <div>
          <h2 className="text-[30px] font-black leading-none tracking-[-0.03em] text-[#111827] max-sm:text-[25px]">Vehicle Applications</h2>
          <span className="mt-4 inline-flex rounded-full bg-[#ffe0d9] px-3 py-1 text-[12px] font-black uppercase tracking-[0.06em] text-[#92400e]">3 Compatible Vehicles</span>
        </div>
      </div>

      <p className="mt-8 text-[16px] leading-7 text-[#4b5563]">
        This part is compatible with the following vehicles. All fitment information is verified for accuracy.
      </p>

      <div className="mt-8 overflow-x-auto rounded-[10px] border border-[#edf0f5] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-white text-[14px] font-black uppercase tracking-[0.04em] text-[#111827]">
              <th className="px-6 py-5"><span className="mr-3 text-[#ed1f24]">▤</span>Vehicle</th>
              <th className="px-6 py-5"><span className="mr-3 text-[#ed1f24]">▣</span>Year Range</th>
              <th className="px-6 py-5"><span className="mr-3 text-[#ed1f24]">⌁</span>Engine</th>
              <th className="px-6 py-5">Chassis Code</th>
              <th className="px-6 py-5">Compatibility</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((item) => (
              <tr key={`${item.detail}-${item.start}`} className={`border-b border-[#eef2f7] last:border-b-0 ${item.highlight ? "bg-[#fff6f6]" : "bg-white"}`}>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#fff1f1] text-[#ed1f24]">▤</span>
                    <div>
                      <p className={`text-[16px] font-black ${item.highlight ? "text-[#d3191d]" : "text-[#111827]"}`}>{item.vehicle}</p>
                      <p className="mt-2 text-[14px] text-[#687386]">{item.detail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-[17px] font-black text-[#111827]">{item.start} <span className="mx-3 text-[#9ca3af]">→</span> {item.end}</td>
                <td className="px-6 py-6 text-[16px] text-[#374151]">{item.engine}</td>
                <td className="px-6 py-6"><span className="rounded-[6px] bg-[#f1f3f6] px-4 py-2 font-mono text-[13px] text-[#4b5563]">{item.chassis}</span></td>
                <td className="px-6 py-6"><span className="inline-flex items-center gap-2 rounded-full border border-[#b7f3ca] bg-[#d9ffe4] px-5 py-2 text-[14px] font-black text-[#04913a]">✓ Compatible</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6 rounded-[12px] border-2 border-[#ed1f24] bg-[#fb4f53] px-8 py-9 text-white shadow-[0_16px_34px_rgba(220,38,38,0.18)] max-md:flex-col max-md:items-stretch max-sm:px-5 max-sm:py-6">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-[12px] bg-white text-[28px] text-[#ed1f24] max-sm:size-12">ⓘ</span>
          <div>
            <h3 className="text-[24px] font-black leading-none max-sm:text-[20px]">Need Fitment Help?</h3>
            <p className="mt-3 text-[17px] font-bold max-sm:text-[14px]">Verify compatibility before ordering</p>
          </div>
        </div>
        <div className="flex gap-3 max-sm:flex-col">
          <a href="https://wa.me/8801718914582" className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-white px-8 text-[16px] font-black text-[#0a9f4a] transition hover:bg-[#ecfff4]">☘ WhatsApp Us</a>
          <a href="tel:01718914582" className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-white px-8 text-[16px] font-black text-[#ed1f24] transition hover:bg-[#fff5f5]">☎ Call Now</a>
        </div>
      </div>
    </section>
  );
}

function DescriptionPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="product-description" className="scroll-mt-24 mx-auto max-w-[1160px] px-5 py-14 text-[15.5px] leading-8 text-[#242424] max-sm:px-4 max-sm:py-10 max-sm:text-[14.5px] max-sm:leading-7">
      <h2 className="text-center text-[42px] font-black leading-tight tracking-[-0.04em] text-[#111111] max-sm:text-[30px]">Product Details</h2>

      <div className="mt-9 space-y-5">
        <p>
          Keep your ride stable and comfortable with this premium <b>front left shock absorber</b>. Specially selected for drivers who want dependable suspension performance, this part helps reduce vibration, improve handling, and restore a confident road feel.
        </p>
        <p>A smart replacement option for worn suspension parts on compatible Toyota Prius α models.</p>
      </div>

      <div className="mt-8 space-y-5">
        <h2 className="text-[42px] font-black leading-tight tracking-[-0.04em] text-[#242424] max-sm:text-[30px]">✨ Smooth Stability in a Direct-Fit Shock Absorber</h2>
        <p>
          This shock absorber is designed to support <b>controlled suspension movement</b> and more predictable handling. It helps keep the tyre planted on uneven roads, giving better comfort and safer daily driving.
        </p>
        <p>Perfect for city traffic, highways, and regular maintenance replacement.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-[42px] font-black leading-tight tracking-[-0.04em] text-[#242424] max-sm:text-[30px]">⭐ Key Features of This Shock Absorber</h2>
        <ul className="mt-5 list-disc space-y-3 pl-6">
          <li>Direct-fit replacement for compatible vehicle models</li>
          <li>Helps reduce vibration, bounce, and road harshness</li>
          {isExpanded && (
            <>
              <li>Improves steering stability and braking confidence</li>
              <li>Durable construction for long-term daily use</li>
              <li>Suitable for front-left suspension replacement</li>
              <li>Balanced ride comfort for city and highway driving</li>
            </>
          )}
        </ul>
        {isExpanded && <p className="mt-6">An essential part of your <b>car suspension maintenance</b> and regular safety care.</p>}
      </div>

      {!isExpanded && (
        <button onClick={() => setIsExpanded(true)} className="mt-8 rounded-full bg-[#1a73e8] px-8 py-4 text-[15px] font-black text-white transition hover:bg-[#155fc4]">Show More</button>
      )}

      {isExpanded && (
        <>
          <div className="mt-8">
            <h2 className="text-[42px] font-black leading-tight tracking-[-0.04em] text-[#242424] max-sm:text-[30px]">💧 Easy to Install - No Guesswork, No Hassle</h2>
            <p className="mt-3"><b>Recommended installation: professional mechanic</b></p>
            <p className="mt-5">How to use:</p>
            <ul className="mt-3 list-disc space-y-3 pl-6">
              <li>Confirm your chassis code and side position before ordering</li>
              <li>Install the part on the front-left suspension assembly</li>
              <li>Inspect related mounts, bushings, and suspension hardware</li>
              <li>Check wheel alignment after installation if needed</li>
            </ul>
            <p className="mt-6">For best performance, replace worn suspension parts before they affect tyre wear or braking stability.</p>
          </div>

          <div className="mt-8">
            <h2 className="text-[42px] font-black leading-tight tracking-[-0.04em] text-[#242424] max-sm:text-[30px]">🌍 Reliable &amp; Cost-Effective Car Care Product in Bangladesh</h2>
            <p className="mt-5">Why keep driving with weak suspension?</p>
            <p className="mt-5">
              A worn shock absorber can reduce comfort, increase body movement, and make the vehicle feel less stable. Replacing it on time helps protect your tyres, suspension, and daily driving confidence.
            </p>
            <p className="mt-5">Ideal for private cars, family vehicles, ride-share drivers, and workshop replacement needs.</p>
          </div>

          <div className="mt-8">
            <h2 className="text-[42px] font-black leading-tight tracking-[-0.04em] text-[#242424] max-sm:text-[30px]">🧪 Product Specifications</h2>
            <ul className="mt-5 list-disc space-y-3 pl-6">
              <li>Product Type: Front Left Shock Absorber</li>
              <li>Part Number: B3337</li>
              <li>Position: Front Left</li>
              <li>Vehicle Fitment: Toyota Prius α HV-ZVW40W</li>
              <li>Condition: New</li>
              <li>Application: Suspension replacement</li>
              <li>Origin: Demo data</li>
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-[42px] font-black leading-tight tracking-[-0.04em] text-[#242424] max-sm:text-[30px]">🏠 Multi-Purpose Maintenance Use</h2>
            <p className="mt-5">Besides replacement use, this part is suitable for:</p>
            <ul className="mt-3 list-disc space-y-3 pl-6">
              <li>Routine suspension repair</li>
              <li>Comfort restoration</li>
              <li>Handling improvement</li>
              <li>Workshop service packages</li>
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-[42px] font-black leading-tight tracking-[-0.04em] text-[#242424] max-sm:text-[30px]">✅ Why Choose This Shock Absorber?</h2>
            <p className="mt-5">It is practical, reliable, and selected for drivers who want smoother suspension performance without compromising safety.</p>
            <p className="mt-5">If you are looking for dependable <b>car parts in Bangladesh</b> with clear fitment and support, this is a strong choice.</p>
          </div>

          <button onClick={() => setIsExpanded(false)} className="mt-8 rounded-full bg-[#1a73e8] px-8 py-4 text-[15px] font-black text-white transition hover:bg-[#155fc4]">Show less</button>
        </>
      )}

      <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden bg-[#f5f5f5]">
        <Image src="/black-odor-red-console.webp" alt="JPSPARE product showcase" fill sizes="(max-width: 1040px) 100vw, 1040px" className="object-cover" />
      </div>
    </section>
  );
}

export default function ProductDetailClient({ slug }) {
  const product = productCopy[slug] || fallbackProduct;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addedRelated, setAddedRelated] = useState([]);
  const [addedBuyingNow, setAddedBuyingNow] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("Description");
  const [isStickyCartVisible, setIsStickyCartVisible] = useState(false);
  const saleTotal = `৳${(quantity * 4680).toLocaleString("en-US")}.00`;
  const handleRelatedAdd = async (item) => {
    const productName = item.name || item.title;
    setAddedRelated((items) => (items.includes(productName) ? items : [...items, productName]));
    await addProductToCart(item);
  };
  const handleBuyingNowAdd = async (item) => {
    const productName = item.name || item.title;
    setAddedBuyingNow((items) => (items.includes(productName) ? items : [...items, productName]));
    await addProductToCart(item);
  };
  const handleMainAdd = async () => {
    setAdded(true);
    await addProductToCart(
      {
        ...product,
        title: "TOKICO Front Left Shock Absorber B3337 (Toyota Prius α HV-ZVW40W)",
        name: "TOKICO Front Left Shock Absorber B3337 (Toyota Prius α HV-ZVW40W)",
        price: "Tk 4,680.00",
        oldPrice: "Tk 7,800.00",
        brand: "HITACHI",
        category: "Shock Absorber",
        image: "/product-gallery-reference.png",
        slug: "hitachi-shock-absorver-b3337",
      },
      quantity
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsStickyCartVisible(window.scrollY > 260);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto grid max-w-[1180px] grid-cols-[0.9fr_1fr] gap-14 px-5 py-12 max-lg:grid-cols-1 max-sm:gap-7 max-sm:px-4 max-sm:py-7">
        <ProductGallery />
        <div className="pt-4 max-sm:pt-0">
          <div className="flex flex-wrap items-center gap-3 max-sm:gap-2">
            <span className="rounded-full border border-[#ff9da1] bg-[#fff1f2] px-4 py-2 text-[13px] font-black uppercase tracking-[0.08em] text-[#e11d22] max-sm:px-3 max-sm:py-1.5 max-sm:text-[11px]">♙ Hitachi</span>
            <span className="rounded-full bg-[#e11d22] px-4 py-2 text-[13px] font-black uppercase tracking-[0.08em] text-white max-sm:px-3 max-sm:py-1.5 max-sm:text-[11px]">% 40% Off</span>
          </div>
          <h1 className="mt-6 max-w-[680px] text-[30px] font-black leading-[1.18] tracking-[-0.02em] text-[#111827] max-sm:mt-4 max-sm:text-[24px]">TOKICO Front Left Shock Absorber B3337 (Toyota Prius α HV-ZVW40W)</h1>
          <div className="mt-4 h-1 w-16 rounded bg-[#e11d22]" />
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <p className="text-[38px] font-black leading-none tracking-[-0.03em] text-[#111827] max-sm:text-[32px]">{saleTotal}</p>
            <p className="text-[20px] font-medium leading-none text-[#6b7280] line-through">৳7,800.00</p>
          </div>
          <p className="mt-8 text-[15px] font-black max-sm:mt-6">⚡ 40 sold in last 24 hours</p>
          <div className="mt-6 max-sm:mt-4"><p className="text-[14px]"><span className="text-[#ff6961]">HURRY UP!</span> Only <span className="text-[22px] text-[#ff6961]">61</span> items left!</p><div className="mt-3 h-1.5 rounded bg-[#e5e7eb]"><div className="h-full w-[62%] rounded bg-[#ff6961]" /></div></div>
          <p className="mt-7 text-[14px] leading-6">🚚 Order in the next 21 hour(s) 48 minute(s) to get it between <b><u>Tuesday, 19th May</u></b> and <b><u>Thursday, 21st May</u></b></p>
          <div className="mt-7 rounded-[15px] border border-[#e5e7eb] bg-white p-5 transition-all duration-300 hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)] hover:bg-[#fff8f8] hover:shadow-[0_18px_40px_rgba(220,38,38,0.12)] focus-within:border-[#f7d95f] focus-within:bg-[#fff8f8] focus-within:shadow-[0_18px_40px_rgba(220,38,38,0.12)] max-sm:p-4">
            <div className="grid grid-cols-[0.75fr_1fr_1fr] gap-2 max-sm:grid-cols-1">
              <div className="flex h-12 items-center justify-between rounded-[10px] border border-[#dfe4ea] bg-white px-4 text-[18px] font-black">
                <button className="text-[#f19397]" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button className="text-[#f19397]" onClick={() => setQuantity(quantity + 1)}>＋</button>
              </div>
              <button disabled className="h-12 rounded-[10px] bg-[#f3989d] text-[16px] font-black text-white opacity-95">Out of Stock</button>
              <button onClick={handleMainAdd} className="h-12 rounded-[10px] bg-[#df8b8f] text-[16px] font-black text-white transition hover:bg-[#d3191d]">{added ? "Added" : "Buy Now"} ›</button>
            </div>
            <button className="mt-3 h-12 w-full rounded-[10px] bg-[#2f74f3] text-[16px] font-black text-white transition hover:bg-[#1d5ed7]">
              ▭ Calculate EMI <span className="ml-2 rounded-full bg-white/25 px-2 py-1 text-[12px]">15 Banks</span>
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
              <button onClick={async () => {
                setWishlisted(!wishlisted);
                await addProductToWishlist({
                  ...product,
                  title: "TOKICO Front Left Shock Absorber B3337 (Toyota Prius α HV-ZVW40W)",
                  name: "TOKICO Front Left Shock Absorber B3337 (Toyota Prius α HV-ZVW40W)",
                  price: "Tk 4,680.00",
                  image: "/product-gallery-reference.png",
                  slug: "hitachi-shock-absorver-b3337",
                });
              }} className="h-10 rounded-[10px] border border-[#d1d5db] bg-white text-[13px] font-black text-[#4b5563] transition hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)] hover:bg-[#fff8e6]">
                ♡ {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <button className="h-10 rounded-[10px] border border-[#d1d5db] bg-white text-[13px] font-black text-[#4b5563] transition hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)] hover:bg-[#fff8e6]">⌯ Share</button>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-4 text-[13px] max-sm:gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-[7px] bg-[#08b77b] text-white">☵</span>
                <p><b>Fast Ship</b><span className="block text-[#4b5563]">24-48 Hours</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-[7px] bg-[#2f74f3] text-white">♢</span>
                <p><b>Warranty</b></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductInfoTabs activeTab={activeInfoTab} setActiveTab={setActiveInfoTab} />
      {activeInfoTab === "Description" && (
        <DescriptionPanel />
      )}
      {activeInfoTab === "Specs" && <SpecsPanel />}
      {activeInfoTab === "Compatibility" && <CompatibilityPanel />}
      {activeInfoTab === "Reviews" && <ProductReviews />}

      <section className="overflow-hidden border-t border-[#fff2d7] bg-[radial-gradient(circle_at_50%_0%,#fff6e5_0%,#fffaf2_30%,#ffffff_72%)] px-6 py-20 max-sm:px-4 max-sm:py-14">
        <div className="mx-auto max-w-[1600px] text-center">
          <div className="inline-flex h-[58px] items-center gap-3 rounded-full border border-[#ff8d8d] bg-[#fff2ee] px-9 text-[15px] font-black uppercase tracking-[0.18em] text-[#c51f24] shadow-[0_16px_30px_rgba(220,38,38,0.10)] max-sm:h-auto max-sm:px-5 max-sm:py-3 max-sm:text-[11px]">
            <span className="text-[22px]">↗</span>
            You Might Also Like
          </div>
          <h2 className="mt-10 text-[56px] font-black leading-none tracking-[-0.06em] text-[#111827] max-md:text-[42px] max-sm:mt-7 max-sm:text-[34px]">
            Related <span className="text-[#f1461d]">Products</span>
          </h2>
          <p className="mt-8 text-[24px] leading-8 text-[#4b5563] max-sm:mt-5 max-sm:text-[16px]">
            Discover other <span className="rounded-[5px] bg-[#f6e7ea] px-1 font-black text-[#273142]">authentic Japanese parts</span> that complement your selection perfectly
          </p>
        </div>

        <div className="related-product-marquee mx-auto mt-14 max-w-[1600px] overflow-hidden">
          <div className="related-product-track flex w-max gap-5">
            {[...relatedProducts, ...relatedProducts].map((item, index) => (
            <article key={`${item.name}-${index}`} className="group/product w-[245px] shrink-0 rounded-[8px] border border-transparent bg-transparent p-2.5 text-left transition duration-200 hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)]">
              <div className="relative -mx-2.5 -mt-2.5 overflow-hidden rounded-t-[8px]">
                <Link
                  href={`/products/${slugify(item.name)}`}
                  className={`block aspect-[10/11] rounded-t-[8px] rounded-b-none border border-[#eef0f3] bg-white bg-[url('/products-reference.png')] bg-[length:1920px_900px] bg-no-repeat ${item.crop} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.055]`}
                  aria-label={item.name}
                />
                <ProductQuickActions productUrl={`/products/${slugify(item.name)}`} productName={item.name} />
              </div>
              <ProductCardInfo
                product={item}
                productUrl={`/products/${slugify(item.name)}`}
                onAdd={() => handleRelatedAdd(item)}
                isAdded={addedRelated.includes(item.name)}
                cardIndex={index}
                compact
              />
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#fff5f5_0%,#fffaf9_34%,#ffffff_78%)] px-6 py-20 max-sm:px-4 max-sm:py-14">
        <div className="mx-auto max-w-[1600px] text-center">
          <div className="inline-flex h-[58px] items-center gap-3 rounded-full border border-[#ff8d8d] bg-[#fff2ee] px-9 text-[15px] font-black uppercase tracking-[0.18em] text-[#c51f24] shadow-[0_16px_30px_rgba(220,38,38,0.10)] max-sm:h-auto max-sm:px-5 max-sm:py-3 max-sm:text-[11px]">
            <span className="text-[22px]">🔥</span>
            Trending Now
          </div>
          <h2 className="mt-10 text-[56px] font-black leading-none tracking-[-0.06em] text-[#111827] max-md:text-[42px] max-sm:mt-7 max-sm:text-[34px]">
            What People Are <span className="text-[#f1461d]">Buying Now</span>
          </h2>
          <p className="mt-8 text-[24px] leading-8 text-[#4b5563] max-sm:mt-5 max-sm:text-[16px]">
            See popular <span className="rounded-[5px] bg-[#f6e7ea] px-1 font-black text-[#273142]">car care essentials</span> customers are adding to their carts today
          </p>
        </div>

        <div className="related-product-marquee mx-auto mt-14 max-w-[1600px] overflow-hidden">
          <div className="related-product-track related-product-track-reverse flex w-max gap-5">
            {[...buyingNowProducts, ...buyingNowProducts].map((item, index) => (
              <article key={`${item.name}-${index}`} className="group/product w-[245px] shrink-0 rounded-[8px] border border-transparent bg-transparent p-2.5 text-left transition duration-200 hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)]">
                <div className="relative -mx-2.5 -mt-2.5 overflow-hidden rounded-t-[8px]">
                  <Link
                    href={`/products/${slugify(item.name)}`}
                    className={`block aspect-[10/11] rounded-t-[8px] rounded-b-none border border-[#eef0f3] bg-white bg-[url('/products-reference.png')] bg-[length:1920px_900px] bg-no-repeat ${item.crop} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.055]`}
                    aria-label={item.name}
                  />
                  <ProductQuickActions productUrl={`/products/${slugify(item.name)}`} productName={item.name} />
                </div>
                <ProductCardInfo
                  product={item}
                  productUrl={`/products/${slugify(item.name)}`}
                  onAdd={() => handleBuyingNowAdd(item)}
                  isAdded={addedBuyingNow.includes(item.name)}
                  cardIndex={index}
                  compact
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className={`fixed inset-x-0 bottom-0 z-[110] border-t border-[#e5e7eb] bg-white shadow-[0_-12px_34px_rgba(15,23,42,0.10)] transition-all duration-150 ease-out ${
        isStickyCartVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}>
        <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4 px-5 py-4 max-md:flex-col max-md:items-stretch max-sm:px-4 max-sm:py-3">
          <div className="flex min-w-0 items-center gap-4 max-sm:gap-3">
            <div className="size-14 shrink-0 bg-[url('/product-detail-reference.jpg')] bg-[length:1920px_5260px] bg-[-730px_-170px] max-sm:size-11" />
            <div className="min-w-0">
              <b className="block truncate text-[14px]">{product.title}</b>
              <p className="product-price-display text-[15px] leading-none text-[#ef3338]">{formatPriceDisplay(product.price)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 max-md:justify-between max-sm:gap-2">
            <div className="flex h-12 items-center gap-5 bg-[#f4f4f4] px-5 max-sm:h-11 max-sm:gap-4 max-sm:px-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              {quantity}
              <button onClick={() => setQuantity(quantity + 1)}>＋</button>
            </div>
            <button onClick={handleMainAdd} className="h-12 bg-black px-12 font-black text-white hover:bg-[#d3191d] max-sm:h-11 max-sm:flex-1 max-sm:px-4 max-sm:text-[13px]">Add to cart</button>
          </div>
        </div>
      </div>
    </main>
  );
}
