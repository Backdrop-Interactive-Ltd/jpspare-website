"use client";

import { addProductToWishlist } from "./commerce-client";

const WISHLIST_KEY = "jpspare-product-wishlist-selection";
const COMPARE_KEY = "jpspare-product-compare-selection";
const COMPARE_ITEMS_KEY = "jpspare-product-compare-items";

function readSelection(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function addSelection(key, productKey) {
  const selection = Array.from(new Set([...readSelection(key), productKey]));
  window.localStorage.setItem(key, JSON.stringify(selection));
  return selection;
}

function writeCompareItems(items) {
  const nextItems = items.slice(-3);
  const selection = nextItems.map((item) => item.key || item.slug).filter(Boolean);
  window.localStorage.setItem(COMPARE_ITEMS_KEY, JSON.stringify(nextItems));
  window.localStorage.setItem(COMPARE_KEY, JSON.stringify(selection));
  return selection;
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <path d="M11 18H8a2 2 0 0 1-2-2V9" />
    </svg>
  );
}

export default function ProductQuickActions({ productUrl = "/products", productName = "Product" }) {
  const productKey = productUrl.split("/").filter(Boolean).pop() || productName;
  const actionClassName = "grid size-10 place-items-center text-[#111827] transition hover:bg-[#fff1f1] hover:text-[#ef3338]";

  async function handleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();
    const selection = addSelection(WISHLIST_KEY, productKey);
    window.dispatchEvent(new CustomEvent("jpspare-wishlist-change", { detail: { count: selection.length } }));
    await addProductToWishlist({ name: productName, title: productName, slug: productKey });
  }

  function handleCompare(event) {
    event.preventDefault();
    event.stopPropagation();
    const items = readSelection(COMPARE_ITEMS_KEY);
    const nextItems = items.some((item) => (item.key || item.slug) === productKey)
      ? items
      : [...items, { key: productKey, slug: productKey, name: productName, title: productName }];
    const selection = writeCompareItems(nextItems);
    window.dispatchEvent(new CustomEvent("jpspare-compare-change", { detail: { count: selection.length } }));
  }

  return (
    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 overflow-hidden rounded-[8px] border border-[#e5eaf1] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.14)]">
      <a href={productUrl} className={actionClassName} aria-label={`View ${productName}`} title="View product">
        <EyeIcon />
      </a>
      <button type="button" onClick={handleWishlist} className={`${actionClassName} border-l border-[#edf1f6]`} aria-label={`Wishlist ${productName}`} title="Add to wishlist">
        <HeartIcon />
      </button>
      <button type="button" onClick={handleCompare} className={`${actionClassName} border-l border-[#edf1f6]`} aria-label={`Compare ${productName}`} title="Add to compare">
        <CompareIcon />
      </button>
    </div>
  );
}
