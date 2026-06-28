"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const COMPARE_SELECTION_KEY = "jpspare-product-compare-selection";
const COMPARE_ITEMS_KEY = "jpspare-product-compare-items";
const MAX_COMPARE_ITEMS = 3;

function Icon({ name, className = "size-4" }) {
  const paths = {
    trend: "m4 17 6-6 4 4 6-8M15 7h5v5",
    chevronUp: "m18 15-6-6-6 6",
    chevronDown: "m6 9 6 6 6-6",
    x: "M18 6 6 18M6 6l12 12",
    eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    trash: "M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 11v6M14 11v6",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function getProductImage(item) {
  return item?.image || item?.thumbnail || item?.primaryImage || "";
}

function readCompareItems() {
  if (typeof window === "undefined") return [];

  try {
    const parsedItems = JSON.parse(window.localStorage.getItem(COMPARE_ITEMS_KEY) || "[]");
    if (!Array.isArray(parsedItems)) return [];

    return parsedItems
      .filter((item) => item && (item.name || item.title || item.slug || item.key))
      .slice(0, MAX_COMPARE_ITEMS)
      .map((item, index) => ({
        key: item.key || item.slug || item.id || `compare-${index}`,
        slug: item.slug || item.key || "",
        name: item.name || item.title || "Selected Product",
        price: item.price || "",
        sku: item.sku || item.partNumber || item.code || "",
        image: getProductImage(item),
        crop: item.crop || "",
      }));
  } catch {
    return [];
  }
}

function writeCompareItems(items) {
  const cleanItems = items.slice(0, MAX_COMPARE_ITEMS);
  const selection = cleanItems.map((item) => item.key).filter(Boolean);

  window.localStorage.setItem(COMPARE_ITEMS_KEY, JSON.stringify(cleanItems));
  window.localStorage.setItem(COMPARE_SELECTION_KEY, JSON.stringify(selection));
  window.dispatchEvent(new CustomEvent("jpspare-compare-change", { detail: { count: selection.length } }));
}

function formatPrice(value) {
  if (!value) return "";
  if (typeof value === "string" && value.includes("৳")) return value;
  const numericValue = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return String(value);
  return `৳${numericValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ProductThumb({ item }) {
  if (item.image) {
    return <span className="block size-11 rounded-[6px] bg-[#eef2f7] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${item.image})` }} />;
  }

  return (
    <span className={`block size-11 rounded-[6px] bg-[#eef2f7] bg-[url('/products-reference.png')] bg-[length:660px_320px] ${item.crop || "bg-center"}`} />
  );
}

export default function CompareFloatingPanel() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(true);
  const count = items.length;
  const progress = useMemo(() => Math.min(100, (count / MAX_COMPARE_ITEMS) * 100), [count]);

  useEffect(() => {
    function syncCompare(event) {
      setItems(readCompareItems());
      if (event?.type === "jpspare-compare-change") setOpen(true);
    }

    syncCompare();
    window.addEventListener("jpspare-compare-change", syncCompare);
    window.addEventListener("storage", syncCompare);

    return () => {
      window.removeEventListener("jpspare-compare-change", syncCompare);
      window.removeEventListener("storage", syncCompare);
    };
  }, []);

  if (count === 0) return null;

  function removeItem(itemKey) {
    writeCompareItems(items.filter((item) => item.key !== itemKey));
  }

  function clearItems() {
    writeCompareItems([]);
  }

  return (
    <aside className="fixed bottom-[86px] right-6 z-[90] w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[18px] border border-[#ef3338]/30 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.20)]">
      <div className="flex h-14 items-center gap-3 bg-[#ef3338] px-5 text-white">
        <Icon name="trend" className="size-5" />
        <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-[15px] font-black">
          Compare ({count}/{MAX_COMPARE_ITEMS})
        </button>
        <button type="button" onClick={() => setOpen((value) => !value)} className="grid size-8 place-items-center rounded-full transition hover:bg-white/15" aria-label={open ? "Minimize compare popup" : "Open compare popup"}>
          <Icon name={open ? "chevronUp" : "chevronDown"} />
        </button>
        <button type="button" onClick={clearItems} className="grid size-8 place-items-center rounded-full transition hover:bg-white/15" aria-label="Clear compare items">
          <Icon name="x" />
        </button>
      </div>

      {open ? (
        <div className="bg-white px-4 py-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.key} className="flex items-center gap-3 rounded-[12px] bg-[#f7f8fa] p-3">
                <ProductThumb item={item} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-black text-[#111827]">{item.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-[12px] font-semibold">
                    {item.price ? <span className="text-[#ef3338]">{formatPrice(item.price)}</span> : null}
                    {item.sku ? <span className="text-[#7b8494]">#{item.sku}</span> : null}
                  </div>
                </div>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#ef3338] text-[12px] font-black text-white shadow-[0_10px_18px_rgba(239,51,56,0.25)]">{index + 1}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Link href="/compare" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[9px] bg-[#ef3338] text-[14px] font-black text-white shadow-[0_14px_28px_rgba(239,51,56,0.24)] transition hover:-translate-y-0.5 hover:bg-[#d91f25]">
              <Icon name="eye" />
              Compare Now
            </Link>
            <button type="button" onClick={clearItems} className="grid size-11 place-items-center rounded-[9px] border border-[#dfe4ea] bg-white text-[#475569] shadow-[0_10px_22px_rgba(15,23,42,0.08)] transition hover:border-[#ef3338] hover:text-[#ef3338]" aria-label="Clear compare list">
              <Icon name="trash" />
            </button>
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-[#596579]">
              <span>Compare Progress</span>
              <span className="text-[#ef3338]">{count}/{MAX_COMPARE_ITEMS}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e9edf3]">
              <span className="block h-full rounded-full bg-[#ef3338] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-1.5 bg-white px-5 py-3 text-center text-[13px] font-medium text-[#475569] shadow-[inset_0_1px_0_rgba(15,23,42,0.06)]">
          <Icon name="trend" className="size-3.5" />
          {count} items ready to compare
        </button>
      )}
    </aside>
  );
}
