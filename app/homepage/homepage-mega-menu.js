import Link from "next/link";
import CategoryBrandRecommendations from "../CategoryBrandRecommendations";
import AccessoryRecommendationScroller from "../AccessoryRecommendationScroller";
import PartsQuoteModalLink from "../PartsQuoteModalLink";
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

function CarPartsMegaMenu({ category }) {
  const menuCategory = category || getMenuCategory(null, "car-parts");
  const menuItems = menuCategory.children || carPartCategories;

  return (
    <MegaMenuShell rootSlug="car-parts" topLabel={categoryTopLabel(menuCategory, getMenuCategory(null, "car-parts")) || "Brakes • Filters • Electrical • Engine"} href={collectionHref(menuCategory.slug)}>
      <div className="grid grid-cols-[minmax(0,1fr)_203px] gap-5">
        <div className="min-w-0 space-y-4">
          <MegaRecommendationBrandSplit recommendedItems={recommendedCarParts} brandCategory="car-parts" brandTitle="POPULAR BRAND" />
          <MegaFeaturePanel icon="package" eyebrow="BROWSE COLLECTION" title="SHOP BY CATEGORY" countLabel={`${menuItems.length} Categories`} eyebrowPosition="bottom">
            <div data-menu-grid="car-parts" className="grid grid-cols-6 gap-3">
              {menuItems.map((category, index) => (
                <MegaDropdownCard key={category.title} {...category} cardIndex={index} />
              ))}
            </div>
          </MegaFeaturePanel>
        </div>
        <PromoRail product="Parts" offer="15% Off Car Parts" />
      </div>
    </MegaMenuShell>
  );
}

function TyresMegaMenu({ category }) {
  const menuCategory = category || getMenuCategory(null, "tyres");
  const menuItems = menuCategory.children || [];

  return (
    <MegaMenuShell rootSlug="tyres" topLabel={categoryTopLabel(menuCategory, getMenuCategory(null, "tyres")) || "TYRES.RIM SIZE"} href={collectionHref(menuCategory.slug)}>
      <div className="grid grid-cols-[minmax(0,1fr)_203px] gap-5">
        <div className="min-w-0 space-y-4">
          <MegaRecommendationBrandSplit recommendedItems={recommendedTyres} brandCategory="tyres" brandTitle="POPULAR BRAND" />
          <MegaFeaturePanel icon="car" eyebrow="BROWSE COLLECTION" title="SHOP BY CATEGORY" countLabel="Tyre Finder" eyebrowPosition="bottom">
            {menuItems.length ? (
              <div data-menu-grid="tyres" className="grid grid-cols-6 gap-3">
                {menuItems.map((category, index) => (
                  <MegaDropdownCard key={category.title} {...category} cardIndex={index} />
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-[1.65fr_1fr] gap-3">
              <MegaDropdownCard title="By Brand" icon="star" tone="purple" href="/products?category=tyres">
                <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
                  {tyreBrands.map((brand) => (
                    <a key={brand} href={`/products?brand=${encodeURIComponent(slugify(brand))}`} className="flex items-center gap-3 text-[12px] font-bold text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]">
                      <span className="grid h-[22px] w-[60px] shrink-0 place-items-center rounded-[4px] border border-[#dfe3ea] bg-white px-1 text-[6px] font-black uppercase tracking-[-0.02em] text-[#111827] shadow-sm">
                        {brand}
                      </span>
                      <span className="truncate">{brand}</span>
                    </a>
                  ))}
                </div>
              </MegaDropdownCard>

              <MegaDropdownCard title="By Rim Size" icon="gear" tone="orange" href="/products?category=tyres">
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {rimSizes.map((size) => (
                    <li key={size}>
                      <a href={`/products?q=${encodeURIComponent(size)}`} className="flex items-center gap-2 truncate text-[12px] font-bold leading-4 text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]">
                        <span className="grid size-3 shrink-0 place-items-center rounded-full border border-[#ef3338]/40 bg-[#fff5f5]">
                          <span className="size-1 rounded-full bg-[#ef3338]" />
                        </span>
                        {size}
                      </a>
                    </li>
                  ))}
                </ul>
              </MegaDropdownCard>
            </div>
            )}
          </MegaFeaturePanel>
        </div>
        <PromoRail product="Premium Tyres" offer="15% Off Tyres" />
      </div>
    </MegaMenuShell>
  );
}

function LubricantMegaMenu({ category }) {
  const menuCategory = category || getMenuCategory(null, "lubricant");
  const menuItems = menuCategory.children || lubricantCategories;

  return (
    <MegaMenuShell rootSlug="lubricant" topLabel={categoryTopLabel(menuCategory, getMenuCategory(null, "lubricant")) || "Engine Oil • Transmission • Coolant"} href={collectionHref(menuCategory.slug)}>
      <div className="grid grid-cols-[minmax(0,1fr)_203px] gap-5">
        <div className="min-w-0 space-y-4">
          <MegaRecommendationBrandSplit recommendedItems={recommendedLubricants} brandCategory="lubricant" brandTitle="POPULAR BRAND" />
          <MegaFeaturePanel icon="drop" eyebrow="BROWSE COLLECTION" title="SHOP BY CATEGORY" countLabel="Quality Fluids" eyebrowPosition="bottom">
            <div data-menu-grid="lubricant" className="grid grid-cols-4 gap-3">
              {menuItems.map((category, index) => (
                <MegaDropdownCard key={category.title} {...category} cardIndex={index} />
              ))}
              <MegaDropdownCard title="By Brand" icon="tag" tone="purple" href="/products?category=lubricant">
                <div className="mt-4 space-y-2.5">
                  {lubricantBrands.map((brand) => (
                    <a key={brand} href={`/products?brand=${encodeURIComponent(slugify(brand))}`} className="flex items-center gap-3 text-[12px] font-bold text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]">
                      <span className="grid h-[22px] w-[60px] shrink-0 place-items-center rounded-[4px] border border-[#dfe3ea] bg-white px-1 text-[6.5px] font-black uppercase tracking-[-0.02em] text-[#111827] shadow-sm">
                        {brand}
                      </span>
                      <span className="truncate">{brand}</span>
                    </a>
                  ))}
                </div>
              </MegaDropdownCard>
            </div>
          </MegaFeaturePanel>
        </div>
        <PromoRail product="Pro Grade Lubricants" offer="15% Off Lubricant" />
      </div>
    </MegaMenuShell>
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
  const menuCategory = category || getMenuCategory(null, "car-accessories");
  const menuItems = menuCategory.children || carAccessorySubcategories;

  return (
    <div className="invisible absolute left-1/2 top-full z-[120] w-[calc(100%-80px)] max-w-[1640px] -translate-x-1/2 overflow-hidden rounded-b-[14px] border border-[#f0d5d8] bg-[#fbfcfd] text-[#111827] opacity-0 shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition duration-200 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100 max-lg:hidden">
      <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-[#f0d5d8] bg-[linear-gradient(90deg,#ffffff_0%,#fff7f7_62%,#fff0f0_100%)] px-7">
        <span data-menu-top-label="car-accessories" className="shrink-0 rounded-full border border-[#f7d95f]/70 bg-[#fffbea] px-4 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#8a5d00]">
          {categoryTopLabel(menuCategory, getMenuCategory(null, "car-accessories")) || "Interior • Exterior • Care • Lifestyle"}
        </span>
        <a
          href={collectionHref(menuCategory.slug)}
          data-menu-view-more="car-accessories"
          className="inline-flex h-8 shrink-0 items-center gap-2 rounded-[7px] bg-[#ef3338] px-4 text-[10px] font-black uppercase tracking-[0.04em] text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d]"
        >
          View More
          <Icon name="arrow" className="size-3" />
        </a>
      </div>
      <div className="p-7">
        <div className="grid grid-cols-[minmax(0,1fr)_203px] gap-5">
          <div className="min-w-0">
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
                <AccessoryRecommendationScroller items={recommendedAccessories} visibleCount={6} />
              </div>

              <div className="group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-0.5 hover:border-[#ef3338]/50 hover:bg-[#fffdfd] hover:shadow-[0_16px_30px_rgba(220,38,38,0.12)] hover:before:opacity-70">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105">
                    <Icon name="tag" className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]">Popular Brand</h4>
                    <span className="mt-1.5 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
                  </div>
                </div>
                <CategoryBrandRecommendations category="car-accessories" limit={12} columns={6} logoSize={66} scrollable visibleCount={6} />
              </div>
            </section>

            <section className="mt-4 rounded-[10px] border border-[#f0cfd2] bg-[linear-gradient(135deg,#fff8f8_0%,#ffffff_52%,#fff9f2_100%)] p-4 shadow-[0_14px_34px_rgba(220,38,38,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-[8px] bg-[#ef3338] text-white shadow-[0_8px_18px_rgba(239,51,56,0.25)]">
                    <Icon name="grid" className="size-4" />
                  </span>
                  <div>
                    <h4 className="text-[17px] font-black leading-none text-[#111827]">SHOP BY CATEGORY</h4>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#ef3338]">Browse Collection</p>
                  </div>
                </div>
                <span className="rounded-full border border-[#f0cfd2] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#ef3338]">
                  {menuItems.length} Categories
                </span>
              </div>

              <div data-menu-grid="car-accessories" className="grid grid-cols-6 gap-3">
                {menuItems.map((category, index) => (
                  <section
                    key={category.title}
                    data-menu-card-index={index}
                    className={`group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-1 hover:border-[#ef3338]/50 hover:shadow-[0_16px_30px_rgba(220,38,38,0.14)] hover:before:opacity-70 ${categoryTone(category.tone)}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-[8px] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105 ${iconTone(category.tone)}`}>
                        <Icon name={category.icon} className="size-4" />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <a
                          href={category.href || collectionHref(slugify(category.title))}
                          data-menu-card-link
                          className="block truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]"
                          title={category.title}
                        >
                          {category.title}
                        </a>
                        <span className="mt-2 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2.5">
                      {category.links.map((link, index) => (
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
                  </section>
                ))}
              </div>
            </section>
          </div>
          <PromoRail product="Accessories" offer="15% Off Accessories" />
        </div>
      </div>
    </div>
  );
}

export function MainNavBar({ showTrackOrder = true, menuCategories }) {
  const categoryNavItems = navItems.map((item) => {
    const category = menuCategorySlugs.includes(slugify(item.label)) ? getMenuCategory(menuCategories, slugify(item.label)) : null;
    return category ? { ...item, label: category.name.toUpperCase(), href: collectionHref(category.slug) } : item;
  });

  return (
    <div className="relative z-[90] border-t border-[#111827]/40 bg-[#d3191d] text-white">
      <div className="mx-auto flex h-[48px] w-full max-w-[1720px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 max-lg:h-auto max-lg:flex-wrap max-lg:py-2">
        <nav className="flex min-w-0 flex-1 items-center gap-[18px] overflow-visible text-[14px] font-bold leading-none max-xl:gap-3 max-xl:text-[13px] max-lg:w-full max-lg:flex-none max-lg:gap-4 max-lg:overflow-x-auto max-lg:pb-2 max-sm:text-[13px]">
          {categoryNavItems.map((item) => (
            item.href === "/collections/car-accessories" ? (
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
              <a key={item.label} href={item.href} className="inline-flex h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition hover:bg-[#dd3b3f] hover:!text-[#f7d95f]">
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
