"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addProductToCart } from "../commerce-client";

const PRODUCT_WISHLIST_SELECTION_KEY = "jpspare-product-wishlist-selection";

function formatPrice(value = 0) {
  return `৳${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return "today";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function removeWishlistSelection(product) {
  try {
    const storedSelection = window.localStorage.getItem(PRODUCT_WISHLIST_SELECTION_KEY);
    const parsedSelection = storedSelection ? JSON.parse(storedSelection) : [];
    if (!Array.isArray(parsedSelection)) return;

    const title = product?.title || product?.name || "";
    const nextSelection = parsedSelection.filter((key) => !String(key).includes(title));
    window.localStorage.setItem(PRODUCT_WISHLIST_SELECTION_KEY, JSON.stringify(nextSelection));
  } catch {
    // localStorage sync is best-effort only.
  }
}

function clearWishlistSelection() {
  try {
    window.localStorage.setItem(PRODUCT_WISHLIST_SELECTION_KEY, JSON.stringify([]));
  } catch {
    // localStorage sync is best-effort only.
  }
}

function Icon({ name, className = "size-4" }) {
  const icons = {
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
    x: "M18 6 6 18M6 6l12 12",
    grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    trash: "M3 6h18m-2 0-.8 14a2 2 0 0 1-2 2H7.8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 5v6m4-6v6",
    clock: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    arrowLeft: "M19 12H5m7-7-7 7 7 7",
    arrowRight: "M5 12h14m-7-7 7 7-7 7",
    layers: "m12 3 9 5-9 5-9-5 9-5Zm-7 9 7 4 7-4M5 16l7 4 7-4",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function WishlistCard({ product, view, onRemove }) {
  const href = product.productUrl || (product.slug ? `/products/${product.slug}` : "/products/hitachi-shock-absorver-b3337");
  const image = product.image || "/products-reference.png";

  return (
    <article
      className={`group relative overflow-hidden rounded-[8px] border border-[#e7ecf3] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#f7d95f] hover:shadow-[0_24px_48px_rgba(239,51,56,0.14)] ${
        view === "list" ? "grid gap-0 sm:grid-cols-[280px_1fr]" : "flex h-full flex-col"
      }`}
    >
      <button type="button" onClick={onRemove} className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-[8px] border border-[#ffd4d6] bg-white/95 text-[#ef3338] shadow-[0_10px_22px_rgba(15,23,42,0.10)] transition hover:scale-105 hover:bg-[#ef3338] hover:text-white" aria-label={`Remove ${product.title}`}>
        <Icon name="trash" className="size-4" />
      </button>

      <Link
        href={href}
        className={`block overflow-hidden bg-[#f6f8fb] bg-contain bg-center bg-no-repeat transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] ${view === "list" ? "h-[250px]" : "h-[270px]"}`}
        style={{ backgroundImage: `url(${image})` }}
        aria-label={`View ${product.title}`}
      />

      <div className={`flex flex-1 flex-col bg-[#fffafa] ${view === "list" ? "justify-center p-6" : "p-5"}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ef3338]">Saved Product</p>
        <Link href={href} className="mt-2 line-clamp-2 min-h-[46px] text-[18px] font-black leading-[1.28] !text-[#111827] transition hover:!text-[#ef3338]">{product.title}</Link>
        <p className="product-price-display mt-4 text-[27px] leading-none text-[#ef171d]">{formatPrice(product.price)}</p>
        <p className="mt-4 flex items-center gap-2 text-[13px] font-medium text-[#7a8496]">
          <Icon name="clock" className="size-4" />
          Added {formatDate(product.added)}
        </p>
        <div className="mt-auto grid grid-cols-[1fr_48px] gap-2 pt-5">
          <Link href={href} className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#ef3338] px-5 text-[15px] font-black !text-white shadow-[0_12px_24px_rgba(239,51,56,0.18)] transition hover:scale-[1.02] hover:bg-[#ef3338]">
            View Product
            <Icon name="arrowRight" className="size-4" />
          </Link>
          <button type="button" onClick={() => addProductToCart(product)} className="grid size-12 place-items-center rounded-[8px] bg-[#111827] text-white transition hover:scale-[1.04] hover:bg-[#ef3338]" aria-label={`Add ${product.title} to cart`}>
            <Icon name="cart" className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function WishlistPageClient() {
  const [items, setItems] = useState([]);
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const itemLabel = useMemo(() => `${items.length} ${items.length === 1 ? "item" : "items"} in wishlist`, [items.length]);

  async function loadWishlist() {
    setLoading(true);
    const response = await fetch("/api/wishlist", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setItems(data.items || []);
    }
    setLoading(false);
  }

  async function removeItem(id) {
    const response = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    if (response.ok) {
      let nextItems = [];
      setItems((current) => {
        const removedProduct = current.find((item) => item.id === id);
        removeWishlistSelection(removedProduct);
        nextItems = current.filter((item) => item.id !== id);
        return nextItems;
      });
      window.dispatchEvent(new CustomEvent("jpspare-wishlist-change", { detail: { count: nextItems.length } }));
    }
  }

  async function clearAll() {
    await Promise.all(items.map((item) => fetch(`/api/wishlist/${item.id}`, { method: "DELETE" })));
    setItems([]);
    clearWishlistSelection();
    window.dispatchEvent(new CustomEvent("jpspare-wishlist-change", { detail: { count: 0 } }));
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#111827]">
      <section className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">
        {items.length ? (
        <div className="relative overflow-hidden rounded-[8px] border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] p-6 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_20%,rgba(239,51,56,0.12),transparent_34%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-black !text-white/70 transition hover:!text-[#ff5b61]">
                <Icon name="arrowLeft" className="size-4" />
                Back to Home
              </Link>
              <p className="mt-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#ff5b61]"><Icon name="heart" className="size-4 fill-current" /> My Wishlist</p>
              <h1 className="mt-3 text-[36px] font-black leading-tight tracking-[-0.03em] text-white sm:text-[46px]">Your Saved Automotive <span className="text-[#ff4a50]">Essentials</span></h1>
              <p className="mt-3 max-w-[620px] text-[16px] font-medium leading-7 text-white/68">Keep your favorite automotive essentials for later and return anytime to complete your purchase.</p>
            </div>

            <div className="min-w-[320px] rounded-[8px] border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/58">Saved Items</p>
                  <p className="product-price-display mt-2 text-[28px] leading-none text-white">{loading ? "..." : items.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-[8px] bg-black/20 p-1">
              <button type="button" onClick={() => setView("grid")} className={`grid size-10 place-items-center rounded-[7px] transition ${view === "grid" ? "bg-white text-[#111827] shadow-sm" : "text-white/55 hover:text-white"}`} aria-label="Grid view">
                <Icon name="grid" className="size-5" />
              </button>
              <button type="button" onClick={() => setView("list")} className={`grid size-10 place-items-center rounded-[7px] transition ${view === "list" ? "bg-white text-[#111827] shadow-sm" : "text-white/55 hover:text-white"}`} aria-label="List view">
                <Icon name="list" className="size-5" />
              </button>
                  </div>
            <button type="button" onClick={clearAll} disabled={!items.length} className="inline-flex h-12 items-center gap-2 rounded-[8px] bg-white px-4 text-[13px] font-black text-[#111827] transition hover:bg-[#ef3338] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
              <Icon name="trash" className="size-4" />
              Clear All
            </button>
                </div>
              </div>
              <p className="mt-3 text-[13px] font-medium text-white/60">{loading ? "Loading wishlist..." : itemLabel}</p>
            </div>
          </div>
        </div>
        ) : null}

        {items.length ? (
          <div className={`mt-8 gap-5 ${view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid grid-cols-1"}`}>
            {items.map((product) => (
              <WishlistCard key={product.id} product={product} view={view} onRemove={() => removeItem(product.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-[#e5e7eb] bg-white px-6 py-16 text-center shadow-[0_20px_44px_rgba(15,23,42,0.06)]">
            <span className="mx-auto grid size-16 place-items-center rounded-[14px] bg-[#fff1f1] text-[#ef3338]"><Icon name="heart" className="size-8" /></span>
            <h2 className="mt-6 text-[28px] font-black text-[#111827]">{loading ? "Loading..." : "Your wishlist is empty"}</h2>
            <p className="mt-3 text-[16px] font-medium text-[#667085]">Save favorite products and come back any time.</p>
            {!loading ? <Link href="/products" className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#ef3338] px-8 text-[15px] font-black !text-white transition hover:scale-[1.04]">Browse Products <Icon name="arrowRight" className="size-4" /></Link> : null}
          </div>
        )}

        {items.length ? <div className="mt-10 flex justify-center">
          <Link href="/products" className="group/wishlist-cta inline-flex h-12 items-center justify-center gap-3 rounded-[8px] !bg-[#ef3338] px-8 text-[15px] font-black !text-white shadow-[0_14px_28px_rgba(239,51,56,0.22)] transition-transform duration-200 hover:scale-[1.045] hover:!bg-[#ef3338] active:scale-[0.985]">
            Continue Shopping
            <Icon name="arrowRight" className="size-4 transition-transform duration-200 group-hover/wishlist-cta:translate-x-1.5" />
          </Link>
        </div> : null}
      </section>
    </main>
  );
}
