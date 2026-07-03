"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CategoryBrandRecommendations from "../CategoryBrandRecommendations";
import AccessoryRecommendationScroller from "../AccessoryRecommendationScroller";
import PartsQuoteModalLink from "../PartsQuoteModalLink";
import { getHomepageClientData } from "@/lib/homepage/client-cache";
import {
  navItems,
  carAccessorySubcategories,
  recommendedAccessories,
  recommendedCarParts,
  recommendedTyres,
  recommendedLubricants,
  carPartCategories,
  tyreBrands,
  rimSizes,
  lubricantCategories,
  lubricantBrands,
  menuCategorySlugs,
  fallbackMenuCategories,
  categoryIconCycle,
  categoryToneCycle,
} from "./homepage-data";
import { Icon, ChevronDown, categoryTone, iconTone, slugify } from "./homepage-ui-helpers";

function collectionHref(slug) {
  return `/collections/${encodeURIComponent(slug)}`;
}

function categoryTopLabel(category, fallback) {
  const children = category?.children?.length ? category.children : fallback?.children || [];
  return children.slice(0, 4).map((item) => item.name || item.title).filter(Boolean).join(" • ");
}

function normalizeMenuCategory(category, fallback) {
  if (!category?.children?.length) return fallback;

  return {
    ...category,
    children: category.children.map((child, index) => ({
      title: child.name,
      href: collectionHref(child.slug),
      icon: categoryIconCycle[index % categoryIconCycle.length],
      tone: categoryToneCycle[index % categoryToneCycle.length],
      links: (child.children || []).map((subCategory) => ({
        label: subCategory.name,
        href: collectionHref(subCategory.slug),
      })),
    })),
  };
}

function getMenuCategory(menuCategories, slug) {
  return menuCategories?.[slug] || fallbackMenuCategories.find((category) => category.slug === slug);
}

function CategoryCard({ category }) {
  return (
    <article className={`group/card min-h-[134px] rounded-[10px] border border-[#e7ebf0] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fffdfd] ${categoryTone(category.tone)}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-[9px] ring-1 ring-black/[0.03] ${iconTone(category.tone)}`}>
          <Icon name={category.icon} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <a href={`#${slugify(category.title)}`} className="block text-[14px] font-black leading-[1.1] text-[#111827] transition group-hover/card:text-current">
            {category.title}
          </a>
          <div className="mt-2.5 h-0.5 w-6 rounded-full bg-[#ef3338]/70 transition-all duration-200 group-hover/card:w-14 group-hover/card:bg-current" />
        </div>
      </div>
      {category.links.length > 0 && (
        <ul className="mt-4 grid gap-1.5 text-[12.5px] font-semibold leading-4 text-[#334155]">
          {category.links.map((link) => (
            <li key={link}>
              <a
                href={`#${slugify(link)}`}
                className="flex items-center gap-2 rounded-[7px] px-2 py-1.5 transition hover:bg-[#fff1f1] hover:text-[#ef3338]"
              >
                <span className="grid size-3 place-items-center rounded-full border border-[#ef3338]/30 bg-[#fff5f5]">
                  <span className="size-1 rounded-full bg-[#ef3338]" />
                </span>
                {link}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function MenuSectionCard({ title, icon, tone, links, children }) {
  return (
    <section className={`group/card min-h-[318px] rounded-[7px] border border-[#eeeeee] bg-white p-4 transition duration-200 hover:-translate-y-0.5 ${categoryTone(tone)}`}>
      <div className="mb-5 flex items-center gap-3">
        <span className={`grid size-8 shrink-0 place-items-center rounded-[7px] ${iconTone(tone)}`}>
          <Icon name={icon} className="size-4" />
        </span>
        <div>
          <a href={`#${slugify(title)}`} className="text-[14px] font-black leading-none text-[#111827] transition group-hover/card:text-current">
            {title}
          </a>
          <div className="mt-3 h-0.5 w-0 bg-current transition-all duration-200 group-hover/card:w-12" />
        </div>
      </div>
      {links && (
        <ul className="space-y-2 text-[12.5px] font-medium leading-4 text-[#1f2937]">
          {links.map((link) => (
            <li key={link}>
              <a href={`#${slugify(link)}`} className="flex items-center gap-1.5 transition hover:text-current">
                <span className="size-2 rounded-full border border-current opacity-60" />
                {link}
              </a>
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}

function PromoRail({ product, offer }) {
  return (
    <aside className="space-y-4">
      <div className="rounded-[7px] bg-gradient-to-br from-[#251a2a] to-[#332238] p-4 text-white">
        <p className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.11em] text-[#ff7070]">
          <Icon name="star" className="size-3.5" />
          Authentic Japanese
        </p>
        <h3 className="mt-2 text-[18px] font-black leading-5">{product}</h3>
        <p className="mt-1 text-[12px] text-[#ff7777]">Guaranteed Fitment</p>
        <a href="/collection" className="mt-3 grid h-[66px] place-items-center rounded-[6px] border border-white/25 bg-[#e5e7eb] text-[13px] font-medium text-[#374151] shadow-[inset_0_0_0_7px_rgba(31,41,55,0.26)]">
          Featured Products
        </a>
        <a href="/products" className="mt-3 grid h-8 place-items-center rounded-[7px] bg-[#f73438] text-[12px] font-black text-[#090909] transition hover:bg-[#ff4a4d]">
          Shop Now
        </a>
      </div>
      <div className="rounded-[7px] bg-[#f33438] p-3 text-white">
        <p className="text-[13px] font-black uppercase leading-4">% LIMITED TIME</p>
        <p className="text-[15px] font-black uppercase leading-4">{offer}</p>
        <p className="text-[12px] leading-4 text-[#3f1a1b]">Code: JAPAN15</p>
        <button className="mt-2 h-[26px] w-full rounded bg-white text-[12px] font-black text-[#e12526] transition hover:bg-[#fff1f1]">
          Claim Discount
        </button>
      </div>
      <div className="space-y-2 text-[12.5px] font-semibold">
        <div className="rounded-[7px] border border-[#b7efd4] bg-[#e9fff3] px-2 py-2 text-[#057a55]">
          <span className="font-black">↻ 100% Authentic</span>
          <span className="block font-medium">Genuine Japanese Parts</span>
        </div>
        <div className="rounded-[7px] border border-[#c9ddff] bg-[#edf5ff] px-2 py-2 text-[#1d4ed8]">
          <span className="font-black">▣ Fast Shipping</span>
          <span className="block font-medium">Same Day Processing</span>
        </div>
        <div className="rounded-[7px] border border-[#ffd2d2] bg-[#fff1ec] px-2 py-2 text-[#e12526]">
          ♡ Quality Guarantee
        </div>
      </div>
    </aside>
  );
}

function MegaMenuShell({ topLabel, href, rootSlug, children }) {
  return (
    <div className="invisible absolute left-1/2 top-full z-[120] w-[calc(100%-80px)] max-w-[1640px] -translate-x-1/2 overflow-hidden rounded-b-[14px] border border-[#f0d5d8] bg-[#fbfcfd] text-[#111827] opacity-0 shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition duration-200 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100 max-lg:hidden">
      <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-[#f0d5d8] bg-[linear-gradient(90deg,#ffffff_0%,#fff7f7_62%,#fff0f0_100%)] px-7">
        <span data-menu-top-label={rootSlug} className="shrink-0 rounded-full border border-[#f7d95f]/70 bg-[#fffbea] px-4 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#8a5d00]">
          {topLabel}
        </span>
        <a
          href={href}
          data-menu-view-more={rootSlug}
          className="inline-flex h-8 shrink-0 items-center gap-2 rounded-[7px] bg-[#ef3338] px-4 text-[10px] font-black uppercase tracking-[0.04em] text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d]"
        >
          View More
          <Icon name="arrow" className="size-3" />
        </a>
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}

function MegaFeaturePanel({ icon, eyebrow, title, countLabel, eyebrowPosition = "top", children }) {
  return (
    <section className="rounded-[10px] border border-[#f0cfd2] bg-[linear-gradient(135deg,#fff8f8_0%,#ffffff_52%,#fff9f2_100%)] p-4 shadow-[0_14px_34px_rgba(220,38,38,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-[8px] bg-[#ef3338] text-white shadow-[0_8px_18px_rgba(239,51,56,0.25)]">
            <Icon name={icon} className="size-4" />
          </span>
          <div>
            {eyebrowPosition === "top" ? <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ef3338]">{eyebrow}</p> : null}
            <h4 className={eyebrowPosition === "top" ? "mt-0.5 text-[17px] font-black leading-none text-[#111827]" : "text-[17px] font-black leading-none text-[#111827]"}>{title}</h4>
            {eyebrowPosition === "bottom" ? <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#ef3338]">{eyebrow}</p> : null}
          </div>
        </div>
        <span className="rounded-full border border-[#f0cfd2] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#ef3338]">
          {countLabel}
        </span>
      </div>
      {children}
    </section>
  );
}

function MegaDropdownCard({ title, icon, tone = "red", links = [], href, cardIndex, children }) {
  const targetHref = href || `/products?category=${encodeURIComponent(slugify(title))}`;

  return (
    <section data-menu-card-index={cardIndex} className={`group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-1 hover:border-[#ef3338]/50 hover:shadow-[0_16px_30px_rgba(220,38,38,0.14)] hover:before:opacity-70 ${categoryTone(tone)}`}>
      <div className="flex items-start gap-2.5">
        <span className={`grid size-9 shrink-0 place-items-center rounded-[8px] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105 ${iconTone(tone)}`}>
          <Icon name={icon} className="size-4" />
        </span>
        <div className="min-w-0 pt-0.5">
          <a
            href={targetHref}
            data-menu-card-link
            className="block truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]"
            title={title}
          >
            {title}
          </a>
          <span className="mt-2 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
        </div>
      </div>
      {links.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {links.map((link, index) => (
            <li key={typeof link === "string" ? link : link.label}>
              <a
                href={typeof link === "string" ? collectionHref(slugify(link)) : link.href}
                data-menu-sub-link-index={index}
                className="flex items-center gap-2 truncate text-[12px] font-bold leading-4 text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]"
                title={typeof link === "string" ? link : link.label}
              >
                <span className="grid size-3 shrink-0 place-items-center rounded-full border border-[#ef3338]/40 bg-[#fff5f5]">
                  <span className="size-1 rounded-full bg-[#ef3338]" />
                </span>
                <span data-menu-sub-link-label className="truncate">{typeof link === "string" ? link : link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}

function MegaRecommendationBrandSplit({ recommendedItems, brandCategory, brandTitle = "Shop By Brand" }) {
  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-0.5 hover:border-[#ef3338]/50 hover:bg-[#fffdfd] hover:shadow-[0_16px_30px_rgba(220,38,38,0.12)] hover:before:opacity-70">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105">
            <Icon name="star" className="size-3.5" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]">Recommended</h4>
            <span className="mt-1.5 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
          </div>
        </div>
        <AccessoryRecommendationScroller items={recommendedItems} visibleCount={6} />
      </div>

      <div className="group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-0.5 hover:border-[#ef3338]/50 hover:bg-[#fffdfd] hover:shadow-[0_16px_30px_rgba(220,38,38,0.12)] hover:before:opacity-70">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105">
            <Icon name="tag" className="size-3.5" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]">{brandTitle}</h4>
            <span className="mt-1.5 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
          </div>
        </div>
        <CategoryBrandRecommendations category={brandCategory} limit={12} columns={6} logoSize={66} scrollable visibleCount={6} />
      </div>
    </section>
  );
}

const carPartsSubcategoryRail = ["Brakes", "Bulb & Lighting", "Electrical Parts", "Filters", "Body Parts", "Wiper Blade", "Horn", "Battery", "Spark Plug", "Shock Absorber", "Engine Parts"];

const premiumCategoryRail = [
  { label: "Accessories", icon: "package", key: "accessories", items: ["Interior", "Exterior", "Electronics", "Car Care", "Utility"] },
  { label: "Car Parts", icon: "gear", key: "car-parts", items: carPartsSubcategoryRail },
  { label: "Tyres", icon: "car", key: "tyres", items: ["By Brand", "By Rim Size", "All Tyres", "Tyre Accessories"] },
  { label: "Lubricants", icon: "drop", key: "lubricants", items: ["Engine Oil", "Gear Oil", "Brake Fluid", "Coolant", "Power Steering Fluid"] },
];

const premiumMenuColumns = [
  {
    title: "Brake System",
    items: ["Brake Pad", "Brake Disc / Rotor", "Brake Shoe", "Brake Drum", "Brake Caliper", "Brake Master Cylinder"],
    icon: "disc",
  },
  {
    title: "Brake Fluid & Oil",
    items: ["Brake Fluid", "Clutch Fluid", "Power Steering Fluid", "Engine Oil", "Gear Oil"],
    icon: "drop",
  },
  {
    title: "Brake Accessories",
    items: ["Brake Hose", "Brake Cable", "Brake Repair Kit", "ABS Sensor", "Brake Springs", "Brake Hardware Kit"],
    icon: "gear",
  },
];

const premiumBrandsMenu = [
  { name: "brembo", className: "text-[#ef3338]" },
  { name: "DENSO", className: "text-[#e11d2e]" },
  { name: "akebono", className: "text-[#2563eb]" },
  { name: "ADVICS", className: "text-[#1d4f91]" },
  { name: "NGK", className: "text-[#ef3338]" },
  { name: "JAPANPARTS", className: "text-[#111827]" },
];

function PremiumRail({ openCategory, selectedSubcategory, onToggleCategory, onSelectSubcategory }) {
  return (
    <aside className="w-[275px] shrink-0 border-r border-[#e5e7eb] pr-5">
      <nav className="space-y-1">
        {premiumCategoryRail.map((item) => (
          <div key={item.label}>
            <button
              type="button"
              aria-expanded={openCategory === item.key}
              onClick={() => onToggleCategory(item.key)}
              className="group/rail flex h-10 w-full items-center gap-3 rounded-[9px] px-3 text-left text-[14px] font-bold text-[#111827] transition hover:bg-[#ef3338] hover:text-white"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#e5e7eb] bg-[#f8fafc] text-[#111827] transition group-hover/rail:border-white/30 group-hover/rail:bg-white/15 group-hover/rail:text-white">
                <Icon name={item.icon} className="size-[15px]" />
              </span>
              <span className="min-w-0 flex-1 truncate uppercase tracking-[0.01em]">{item.label}</span>
              <span className={`text-[18px] leading-none transition group-hover/rail:text-white ${openCategory === item.key ? "-rotate-90" : "rotate-90"}`}>›</span>
            </button>
            {openCategory === item.key && (
              <div className="ml-10 mt-2 space-y-0.5 pb-2">
                {item.items.map((subcategory) => (
                  <button
                    type="button"
                    key={subcategory}
                    onMouseEnter={() => onSelectSubcategory(item.key, subcategory)}
                    onFocus={() => onSelectSubcategory(item.key, subcategory)}
                    onClick={() => onSelectSubcategory(item.key, subcategory)}
                    className={`group/sub flex h-8 w-full items-center gap-2 rounded-[7px] px-2 text-left text-[13px] font-bold transition hover:bg-[#fff1f2] hover:text-[#ef3338] ${selectedSubcategory === subcategory ? "bg-[#fff1f2] text-[#ef3338]" : "text-[#111827]"}`}
                  >
                    <span className={`grid size-[14px] shrink-0 place-items-center rounded-full border ${selectedSubcategory === subcategory ? "border-[#ef3338] text-[#ef3338]" : "border-[#94a3b8] text-[#64748b] group-hover/sub:border-[#ef3338] group-hover/sub:text-[#ef3338]"}`}>
                      <span className="size-[4px] rounded-full bg-current" />
                    </span>
                    <span className="truncate">{subcategory}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function PremiumColumnHeading({ children }) {
  return (
    <h4 className="mb-3 text-[13px] font-black uppercase tracking-[-0.01em] text-[#111827]">
      {children}
      <span className="mt-2 block h-0.5 w-8 rounded-full bg-[#ef3338]" />
    </h4>
  );
}

function PremiumProductColumn({ title, items, icon }) {
  return (
    <section className="border-r border-[#e5e7eb] pr-5 last:border-r-0">
      <PremiumColumnHeading>{title}</PremiumColumnHeading>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item}>
            <a href={`/products?q=${encodeURIComponent(item)}`} className="group/product flex items-center gap-3 text-[13px] font-semibold text-[#111827] transition hover:text-[#ef3338]">
              <span className="grid size-9 shrink-0 place-items-center rounded-[9px] border border-[#e5e7eb] bg-white text-[#111827] shadow-sm transition group-hover/product:border-[#fecdd3] group-hover/product:bg-[#fff1f2] group-hover/product:text-[#ef3338]">
                <Icon name={icon} className="size-[17px]" />
              </span>
              <span>{item}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PremiumBrandColumn() {
  return (
    <section>
      <PremiumColumnHeading>Popular Brands</PremiumColumnHeading>
      <div className="space-y-2">
        {premiumBrandsMenu.map((brand) => (
          <a key={brand.name} href={`/products?brand=${encodeURIComponent(slugify(brand.name))}`} className="group/brand flex h-11 items-center justify-between rounded-[9px] border border-[#e5e7eb] bg-white px-4 shadow-sm transition hover:border-[#fecdd3] hover:bg-[#fffafa]">
            <span className={`text-[18px] font-black tracking-[-0.05em] ${brand.className}`}>{brand.name}</span>
            <span className="text-[22px] text-[#6b7280] transition group-hover/brand:translate-x-0.5 group-hover/brand:text-[#ef3338]">›</span>
          </a>
        ))}
      </div>
      <a href="/brands" className="mt-3 inline-flex items-center gap-2 text-[13px] font-black text-[#ef3338] transition hover:text-[#d71920]">
        View All Brands <Icon name="arrow" className="size-4" />
      </a>
    </section>
  );
}

function PremiumPromoPanel() {
  return (
    <aside className="w-[280px] shrink-0 space-y-4">
      <div className="relative h-[285px] overflow-hidden rounded-[14px] bg-[#0b1220] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
        <div className="absolute -right-12 top-[68px] size-44 rounded-full border-[26px] border-[#374151] opacity-95" />
        <div className="absolute -right-4 top-[100px] size-24 rounded-full border-[16px] border-[#ef3338] opacity-95" />
        <div className="absolute right-8 top-[137px] size-5 rounded-full bg-[#111827]" />
        <p className="relative text-[16px] font-bold text-[#ef3338]">Premium</p>
        <h3 className="relative mt-2 text-[32px] font-black leading-[1.02] tracking-[-0.04em]">Brake<br />Parts</h3>
        <p className="relative mt-4 max-w-[150px] text-[15px] font-medium leading-6 text-white/90">Safety. Performance. Reliability.</p>
        <a href="/products?q=brake" className="group/shop absolute bottom-6 left-6 inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#ef3338] px-5 text-[14px] font-black text-white transition hover:bg-[#d71920]">
          Shop Now <Icon name="arrow" className="size-4 transition group-hover/shop:translate-x-1" />
        </a>
      </div>
      <div className="space-y-3 rounded-[12px] border border-[#e5e7eb] bg-white p-4">
        {[
          ["tag", "15% Offer", "On selected brake parts"],
          ["shield", "100% Authentic", "Genuine & Trusted"],
          ["truck", "Fast Shipping", "Across Bangladesh"],
          ["rotate", "Easy Returns", "7 Days Return Policy"],
        ].map(([icon, title, subtitle]) => (
          <div key={title} className="flex items-start gap-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#fff1f2] text-[#ef3338]">
              <Icon name={icon} className="size-[15px]" />
            </span>
            <span>
              <strong className="block text-[13px] font-black text-[#111827]">{title}</strong>
              <span className="block text-[12px] text-[#6b7280]">{subtitle}</span>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PremiumHelpBar() {
  return (
    <div className="ml-[300px] mt-4 flex min-h-[76px] items-center justify-between gap-5 rounded-[10px] border border-[#e5e7eb] bg-[#f8fafc] px-7 py-3">
      <div className="flex items-center gap-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#fff1f2] text-[#ef3338]">
          <Icon name="headphones" className="size-6" />
        </span>
        <span>
        <h4 className="text-[18px] font-black tracking-[-0.03em] text-[#111827]">Need Help Finding the Right Part?</h4>
        <p className="mt-1 text-[13px] font-medium text-[#4b5563]">Our experts are ready to help you find the perfect fit.</p>
        </span>
      </div>
      <div className="flex gap-4">
        <a href="tel:09617226688" className="flex h-[54px] w-[210px] items-center gap-4 rounded-[9px] border border-[#e5e7eb] bg-white px-5 text-[#111827] transition hover:border-[#fecdd3] hover:text-[#ef3338]">
          <Icon name="phone" className="size-5 text-[#ef3338]" />
          <span><span className="block text-[13px] font-medium">Call Us Now</span><strong className="block text-[16px] font-black">09617 22 66 88</strong></span>
        </a>
        <a href="/help" className="flex h-[54px] w-[225px] items-center gap-4 rounded-[9px] border border-[#fecdd3] bg-[#fff1f2] px-5 text-[#ef3338] transition hover:bg-[#fee2e2]">
          <Icon name="headphones" className="size-5" />
          <span><span className="block text-[14px] font-black">Chat with Expert</span><span className="block text-[13px] font-medium">We're Online</span></span>
        </a>
      </div>
    </div>
  );
}

function PremiumMegaMenuShell({ children }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const menuContent = typeof children === "function" ? children({ selectedSubcategory }) : children;
  const hasRevealContent = selectedSubcategory === "Brakes";

  function handleToggleCategory(categoryKey) {
    setOpenCategory((current) => (current === categoryKey ? null : categoryKey));
    setSelectedSubcategory(null);
  }

  function handleSelectSubcategory(categoryKey, subcategory) {
    setOpenCategory(categoryKey);
    setSelectedSubcategory(subcategory);
  }

  return (
    <div className={`invisible absolute left-10 top-full z-[120] max-w-[calc(100vw-80px)] translate-y-2 rounded-[16px] border border-[#e5e7eb] bg-white p-5 text-[#111827] opacity-0 shadow-[0_28px_76px_rgba(15,23,42,0.18)] transition duration-200 ease-out group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100 max-lg:hidden ${hasRevealContent ? "w-[1635px]" : "w-fit"}`}>
      <div className="flex gap-5">
        <PremiumRail
          openCategory={openCategory}
          selectedSubcategory={selectedSubcategory}
          onToggleCategory={handleToggleCategory}
          onSelectSubcategory={handleSelectSubcategory}
        />
        {hasRevealContent && (
          <main className="min-w-0 flex-1">
            <div className="grid grid-cols-[0.95fr_0.95fr_1fr_0.9fr] gap-4">
              {menuContent}
            </div>
          </main>
        )}
        <PremiumPromoPanel />
      </div>
      {hasRevealContent && <PremiumHelpBar />}
    </div>
  );
}

function PremiumRevealContent({ selectedSubcategory }) {
  if (selectedSubcategory !== "Brakes") {
    return null;
  }

  return (
    <>
      {premiumMenuColumns.map((column) => (
        <PremiumProductColumn key={column.title} {...column} />
      ))}
      <PremiumBrandColumn />
    </>
  );
}

function CarPartsMegaMenu({ category }) {
  return (
    <PremiumMegaMenuShell>
      {({ selectedSubcategory }) => <PremiumRevealContent selectedSubcategory={selectedSubcategory} />}
    </PremiumMegaMenuShell>
  );
}

function TyresMegaMenu({ category }) {
  return (
    <PremiumMegaMenuShell>
      {({ selectedSubcategory }) => <PremiumRevealContent selectedSubcategory={selectedSubcategory} />}
    </PremiumMegaMenuShell>
  );
}

function LubricantMegaMenu({ category }) {
  return (
    <PremiumMegaMenuShell>
      {({ selectedSubcategory }) => <PremiumRevealContent selectedSubcategory={selectedSubcategory} />}
    </PremiumMegaMenuShell>
  );
}

function MegaMenuCta({ href, eyebrow, text, buttonText }) {
  return (
    <div className="mt-5 flex items-center justify-between rounded-[10px] border border-[#ffd9d9] bg-[#fff5f5] p-4">
      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#ef3338]">{eyebrow}</p>
        <p className="mt-1 text-[15px] font-bold text-[#111827]">{text}</p>
      </div>
      <a href={href} className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#ef3338] px-5 text-[14px] font-black text-white transition hover:bg-[#d3191d]">
        {buttonText}
        <Icon name="arrow" className="size-4" />
      </a>
    </div>
  );
}

function CarAccessoriesMegaMenu({ category }) {
  return (
    <PremiumMegaMenuShell>
      {({ selectedSubcategory }) => <PremiumRevealContent selectedSubcategory={selectedSubcategory} />}
    </PremiumMegaMenuShell>
  );
}

function BrowseCategoriesMegaMenu() {
  return (
    <PremiumMegaMenuShell>
      {({ selectedSubcategory }) => <PremiumRevealContent selectedSubcategory={selectedSubcategory} />}
    </PremiumMegaMenuShell>
  );
}

function BrowseMenuIcon() {
  return (
    <svg className="h-[14px] w-[16px] shrink-0" viewBox="0 0 16 14" fill="none" aria-hidden="true">
      <path d="M2 3h12M2 7h12M2 11h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function normalizeCmsNavItems(items) {
  if (!Array.isArray(items) || !items.length) return null;

  const normalized = items
    .map((item, index) => ({
      label: String(item?.label || "").trim(),
      href: String(item?.href || "").trim(),
      enabled: item?.enabled !== false,
      sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      hasMenu: item?.hasMenu === true,
    }))
    .filter((item) => item.label && item.href && item.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return normalized.length ? normalized : null;
}

export function MainNavBar({ showTrackOrder = true, menuCategories }) {
  const [cmsNavItems, setCmsNavItems] = useState(null);
  const sourceNavItems = cmsNavItems || navItems;

  useEffect(() => {
    let mounted = true;

    getHomepageClientData()
      .then((payload) => {
        if (!mounted) return;
        setCmsNavItems(normalizeCmsNavItems(payload?.cms?.navigation?.main));
      })
      .catch(() => {
        if (mounted) setCmsNavItems(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categoryNavItems = sourceNavItems.map((item) => {
    const category = menuCategorySlugs.includes(slugify(item.label)) ? getMenuCategory(menuCategories, slugify(item.label)) : null;
    return category ? { ...item, label: category.name.toUpperCase(), href: collectionHref(category.slug) } : item;
  });
  const dropdownCategoryHrefs = new Set(["/collections/car-accessories", "/collections/car-parts", "/collections/tyres", "/collections/lubricant"]);
  const navigationItems = categoryNavItems.reduce((items, item) => {
    if (item.href === "/") {
      items.push({ label: "BROWSE CATEGORIES", href: "/category", isBrowseCategories: true });
    }

    items.push(item);

    return items;
  }, []).filter((item) => item.isBrowseCategories || (item.href !== "/" && !dropdownCategoryHrefs.has(item.href)));

  return (
    <div className="relative z-[90] border-t border-[#111827]/40 bg-[#d3191d] text-white">
      <div className="mx-auto flex h-[48px] w-full max-w-[1720px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 max-lg:h-auto max-lg:flex-wrap max-lg:py-2">
        <nav className="flex min-w-0 flex-1 items-center gap-[18px] overflow-visible text-[14px] font-bold leading-none max-xl:gap-3 max-xl:text-[13px] max-lg:w-full max-lg:flex-none max-lg:gap-4 max-lg:overflow-x-auto max-lg:pb-2 max-sm:text-[13px]">
          {navigationItems.map((item) => (
            item.isBrowseCategories ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="browse-categories" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <BrowseMenuIcon />
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <BrowseCategoriesMegaMenu />
              </div>
            ) : item.href === "/collections/car-accessories" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="car-accessories" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <CarAccessoriesMegaMenu category={getMenuCategory(menuCategories, "car-accessories")} />
              </div>
            ) : item.href === "/collections/car-parts" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="car-parts" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <CarPartsMegaMenu category={getMenuCategory(menuCategories, "car-parts")} />
              </div>
            ) : item.href === "/collections/tyres" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="tyres" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <TyresMegaMenu category={getMenuCategory(menuCategories, "tyres")} />
              </div>
            ) : item.href === "/collections/lubricant" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="lubricant" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <LubricantMegaMenu category={getMenuCategory(menuCategories, "lubricant")} />
              </div>
            ) : item.label === "PARTS QUOTE" ? (
              <PartsQuoteModalLink
                key={item.label}
                className="inline-flex h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition hover:bg-[#dd3b3f] hover:!text-[#f7d95f]"
              >
                {item.label}
              </PartsQuoteModalLink>
            ) : (
              <a key={item.label} href={item.href} className={`inline-flex h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition hover:bg-[#dd3b3f] hover:!text-[#f7d95f] ${item.label === "BRANDS" ? "lg:ml-[8px] xl:ml-[10px] 2xl:ml-[12px]" : ""}`}>
                <span className="leading-none">{item.label}</span>
                {item.hasMenu && <ChevronDown className="size-[11px] translate-y-px" />}
              </a>
            )
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-4 text-[14px] font-bold text-white max-xl:gap-3 max-xl:text-[13px] max-lg:w-full max-lg:justify-end max-lg:gap-5 max-sm:text-[13px]">
          <Link href="/help" className="inline-flex h-[34px] items-center gap-2 rounded-[7px] px-2 leading-none transition hover:bg-[#dd3b3f] hover:!text-[#f7d95f]">
            <Icon name="headphones" className="size-5" />
            <span className="leading-none">HELP</span>
          </Link>
          <div className="group/app relative flex h-[48px] items-center max-lg:h-auto">
            <button type="button" className="inline-flex h-[34px] items-center gap-2 rounded-[7px] px-2 leading-none transition group-hover/app:bg-[#dd3b3f] group-hover/app:text-[#f7d95f]">
              <span className="leading-none">DOWNLOAD APP</span>
              <ChevronDown className="size-[11px] translate-y-px transition group-hover/app:rotate-180" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-[455px] translate-y-2 rounded-[10px] border border-[#e5e7eb] bg-white p-6 text-[#111827] opacity-0 shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition duration-200 before:absolute before:-top-3 before:right-[116px] before:size-6 before:rotate-45 before:bg-white before:shadow-[-1px_-1px_0_0_#e5e7eb] group-hover/app:visible group-hover/app:translate-y-0 group-hover/app:opacity-100 max-sm:right-auto max-sm:left-0 max-sm:w-[calc(100vw-32px)] max-sm:p-4">
              <div className="relative z-10 flex items-center gap-6 max-sm:gap-4">
                <div className="grid size-[138px] shrink-0 grid-cols-7 grid-rows-7 gap-1 bg-white p-2 shadow-[inset_0_0_0_1px_#111827] max-sm:size-[116px]">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span
                      key={index}
                      className={`${[0, 1, 2, 4, 6, 7, 9, 10, 12, 13, 14, 16, 18, 21, 22, 23, 25, 27, 28, 30, 32, 34, 35, 36, 38, 40, 42, 43, 45, 46, 48].includes(index) ? "bg-[#111827]" : "bg-white"}`}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[18px] font-black leading-tight text-[#111827] max-sm:text-[16px]">Download The JPSPARE App</h4>
                  <p className="mt-3 text-[13px] font-medium leading-6 text-[#4b5563] max-sm:text-[12px] max-sm:leading-5">
                    Scan the QR code with your phone camera or any QR code scanner
                  </p>
                  <div className="mt-4 flex gap-2 max-sm:flex-col">
                    <a href="#download-ios" className="flex h-10 items-center justify-center gap-2 rounded-[5px] bg-black px-3 text-[11px] font-bold leading-none text-white transition hover:bg-[#1f2937]">
                      <span className="text-[18px]">●</span>
                      <span><span className="block text-[8px] font-medium">Download on the</span>App Store</span>
                    </a>
                    <a href="#download-android" className="flex h-10 items-center justify-center gap-2 rounded-[5px] bg-black px-3 text-[11px] font-bold leading-none text-white transition hover:bg-[#1f2937]">
                      <span className="text-[18px] text-[#37d160]">▶</span>
                      <span><span className="block text-[8px] font-medium">GET IT ON</span>Google Play</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showTrackOrder && (
            <Link href="/track-order" className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[11px] border border-[#f5b9bc] bg-white px-[16px] text-[14px] font-black leading-none !text-[#ef3338] shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-all duration-200 hover:scale-[1.04] hover:bg-[#fff2f2] hover:shadow-[0_16px_30px_rgba(220,38,38,0.28)] active:scale-[1.01] max-xl:px-3 max-sm:h-9 max-sm:px-4 max-sm:text-[12px]">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[#ef3338]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6M8 13h8M8 17h6" />
              </svg>
              <span className="leading-none !text-[#ef3338]">Track Order</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
