"use client";

const brandMatchers = [
  ["ADVICS", /advics/i],
  ["BREMBO", /brembo/i],
  ["DENSO", /denso/i],
  ["Flamingo", /flamingo/i],
  ["Kangaroo", /kangaroo/i],
  ["Liqui Moly", /liqui\s*moly/i],
  ["Michelin", /michelin/i],
  ["Mitsubishi", /mitsubishi/i],
  ["Mobil 1", /mobil/i],
  ["Philips", /philips/i],
  ["TOKICO", /tokico/i],
  ["TOTAL", /total/i],
  ["Yesido", /yesido/i],
  ["Joyroom", /joyroom/i],
  ["MOXOM", /moxom/i],
];

export function deriveBrand(name) {
  const match = brandMatchers.find(([, pattern]) => pattern.test(name));
  return match ? match[0] : "JPSPARE";
}

export function parsePriceValue(price) {
  const match = String(price).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

export function priceRangeText(products) {
  const prices = products.map((product) => parsePriceValue(product.price)).filter(Boolean);

  if (!prices.length) {
    return "৳650 - ৳20,900";
  }

  return `৳${Math.min(...prices).toLocaleString("en-US")} - ৳${Math.max(...prices).toLocaleString("en-US")}`;
}

export function makeFacetOptions(values) {
  const counts = new Map();

  values.forEach((value) => {
    if (!value) {
      return;
    }

    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label));
}

function FilterSlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9M7 4v6M17 14v6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function FilterGroup({ title, accent = "red", children, scroll }) {
  const accentClasses = {
    green: "border-[#9ef2bd] bg-[#edfff5] text-[#111827]",
    red: "border-[#f7d95f] bg-[linear-gradient(105deg,#fff3f2_0%,#fffaf0_100%)] text-[#111827]",
  };
  const dotClasses = {
    green: "bg-[#23c55e]",
    red: "bg-[#ff4a4a]",
  };

  return (
    <section className={`overflow-hidden rounded-[12px] border ${accentClasses[accent]}`}>
      <header className="flex h-[60px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className={`size-2 rounded-full ${dotClasses[accent]}`} />
          <h3 className="text-[15px] font-black text-[#111827]">{title}</h3>
        </div>
        <ChevronIcon />
      </header>
      <div className={`border-t border-inherit bg-white/70 ${scroll ? "max-h-[258px] overflow-y-auto" : ""}`}>{children}</div>
    </section>
  );
}

function CheckboxRow({ option, checked, onToggle }) {
  return (
    <label className="mb-2 flex min-h-[38px] cursor-pointer items-center gap-3 rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[14px] font-semibold text-[#344054] shadow-[0_2px_7px_rgba(15,23,42,0.04)] transition hover:border-[#f7d95f] hover:bg-[#fffafa] hover:shadow-[0_12px_24px_rgba(220,38,38,0.10)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(option.label)}
        className="size-4 rounded border-[#cbd5e1] text-[#ef3338] focus:ring-[#ef3338]"
      />
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      <span className="rounded-[7px] bg-[#f1f5f9] px-2 py-1 text-[12px] font-bold text-[#667085]">{option.count}</span>
    </label>
  );
}

export default function DynamicFilters({
  priceText,
  brands,
  productTypes,
  selectedBrands,
  selectedProductTypes,
  onToggleBrand,
  onToggleProductType,
}) {
  return (
    <aside className="w-full rounded-[15px] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.12)] lg:sticky lg:top-[92px]">
      <div className="overflow-hidden rounded-[15px] border border-[#e4e7ec]">
        <div className="bg-[linear-gradient(135deg,#3b251c_0%,#8a4d07_50%,#111827_100%)] px-6 py-7 text-white">
          <div className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-full bg-white/20 text-white">
              <FilterSlidersIcon />
            </span>
            <h2 className="text-[20px] font-black">Dynamic Filters</h2>
          </div>
          <p className="mt-8 text-[15px] leading-6 text-white/90">Shopify native dynamic filtering system</p>
        </div>

        <div className="space-y-8 p-6">
          <FilterGroup title="Price Range" accent="green">
            <div className="flex h-10 items-center justify-center text-[13px] font-semibold text-[#4b5563]">{priceText}</div>
          </FilterGroup>

          <FilterGroup title="Brand" scroll>
            <div className="p-3">
              {brands.map((option) => (
                <CheckboxRow key={option.label} option={option} checked={selectedBrands.includes(option.label)} onToggle={onToggleBrand} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Product type" scroll>
            <div className="p-3">
              {productTypes.map((option) => (
                <CheckboxRow key={option.label} option={option} checked={selectedProductTypes.includes(option.label)} onToggle={onToggleProductType} />
              ))}
            </div>
          </FilterGroup>
        </div>
      </div>
    </aside>
  );
}
