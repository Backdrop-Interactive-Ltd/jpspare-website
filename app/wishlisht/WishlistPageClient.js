"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const initialWishlist = [
  {
    id: "denso-vfkbh20",
    title: "Denso Spark Plug VFKBH20 (Toyota Hiace- TRH200V,200K)",
    price: "৳7,900.00",
    added: "20/05/2026",
    crop: "bg-[-1090px_-300px]",
    slug: "/products/hitachi-shock-absorver-b3337",
  },
  {
    id: "denso-iridium-vfch16",
    title: "DENSO IRIDIUM TOUGH VFCH16 (Noah HV, Esquire HV)",
    price: "৳7,800.00",
    added: "20/05/2026",
    crop: "bg-[-1084px_-292px]",
    slug: "/products/hitachi-shock-absorver-b3337",
  },
  {
    id: "denso-vfxehc22g",
    title: "Denso Spark Plug VFXEHC22G",
    price: "৳8,000.00",
    added: "20/05/2026",
    crop: "bg-[-1008px_-298px]",
    slug: "/products/hitachi-shock-absorver-b3337",
  },
  {
    id: "tokico-b3337",
    title: "TOKICO Front Left Shock Absorber B3337 (Toyota Prius α HV)",
    price: "৳4,680.00",
    added: "20/05/2026",
    crop: "bg-[-1318px_-37px]",
    slug: "/products/hitachi-shock-absorver-b3337",
  },
];

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
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function WishlistCard({ product, view, onRemove }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[12px] border border-[#dfe5ec] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition duration-200 hover:border-[#f7d95f] hover:shadow-[0_20px_45px_rgba(239,51,56,0.12)] ${
        view === "list" ? "grid gap-5 p-4 sm:grid-cols-[260px_1fr]" : ""
      }`}
    >
      <button type="button" onClick={onRemove} className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white text-[#667085] shadow-[0_10px_22px_rgba(15,23,42,0.16)] transition hover:bg-[#ef3338] hover:text-white" aria-label={`Remove ${product.title}`}>
        <Icon name="x" className="size-4" />
      </button>

      <Link
        href={product.slug}
        className={`block bg-white bg-[url('/products-reference.png')] bg-[length:1920px_900px] bg-no-repeat transition duration-200 group-hover:scale-[1.012] ${
          view === "list" ? `h-[230px] rounded-[8px] ${product.crop}` : `h-[310px] ${product.crop}`
        }`}
        aria-label={`View ${product.title}`}
      />

      <div className={`${view === "list" ? "flex flex-col justify-center" : "px-5 pb-5"}`}>
        <h2 className="line-clamp-2 min-h-[54px] text-[20px] font-black leading-[1.35] text-[#111827]">{product.title}</h2>
        <p className="mt-4 text-[24px] font-black text-[#df171d]">{product.price}</p>
        <p className="mt-4 flex items-center gap-2 text-[15px] text-[#667085]">
          <Icon name="clock" className="size-4" />
          Added {product.added}
        </p>
        <Link href={product.slug} className="mt-5 flex h-12 items-center justify-center rounded-[8px] bg-[#ef3f42] px-5 text-[17px] font-black text-white transition hover:bg-[#111827]">
          View Product
        </Link>
      </div>
    </article>
  );
}

export default function WishlistPageClient() {
  const [items, setItems] = useState(initialWishlist);
  const [view, setView] = useState("grid");
  const itemLabel = useMemo(() => `${items.length} ${items.length === 1 ? "item" : "items"} in wishlist`, [items.length]);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-3 rounded-full border border-[#fecaca] bg-[#fff1f1] px-7 py-3 text-[15px] font-black uppercase tracking-[0.12em] text-[#c8191f]">
            <Icon name="heart" className="size-5 fill-[#ef3f42] stroke-[#ef3f42]" />
            My Wishlist
          </span>
          <h1 className="mt-8 text-[46px] font-black leading-tight tracking-[-0.03em] text-[#111827] max-sm:text-[34px]">
            Your Favorite <span className="text-[#ef3f42]">Parts</span>
          </h1>
          <p className="mt-4 text-[22px] text-[#4b5563] max-sm:text-[17px]">Keep track of the Japanese automotive parts you love</p>
        </div>

        <div className="mx-auto mt-16 flex max-w-[1280px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[18px] font-medium text-[#273142]">{itemLabel}</p>
          <div className="flex items-center gap-6">
            <div className="flex rounded-[8px] bg-[#e5e7eb] p-1">
              <button type="button" onClick={() => setView("grid")} className={`grid size-10 place-items-center rounded-[7px] transition ${view === "grid" ? "bg-white text-[#111827] shadow-sm" : "text-[#8a94a6]"}`} aria-label="Grid view">
                <Icon name="grid" className="size-5" />
              </button>
              <button type="button" onClick={() => setView("list")} className={`grid size-10 place-items-center rounded-[7px] transition ${view === "list" ? "bg-white text-[#111827] shadow-sm" : "text-[#8a94a6]"}`} aria-label="List view">
                <Icon name="list" className="size-5" />
              </button>
            </div>
            <button type="button" onClick={() => setItems([])} className="inline-flex items-center gap-2 text-[15px] font-medium text-[#ef3338] transition hover:text-[#111827]">
              <Icon name="trash" className="size-4" />
              Clear All
            </button>
          </div>
        </div>

        {items.length ? (
          <div className={`mx-auto mt-8 max-w-[1280px] gap-6 ${view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-4" : "grid grid-cols-1"}`}>
            {items.map((product) => (
              <WishlistCard key={product.id} product={product} view={view} onRemove={() => setItems((current) => current.filter((item) => item.id !== product.id))} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-[760px] rounded-[14px] border border-[#e5e7eb] bg-white px-6 py-16 text-center shadow-[0_18px_38px_rgba(15,23,42,0.06)]">
            <h2 className="text-[30px] font-black text-[#111827]">Your wishlist is empty</h2>
            <p className="mt-3 text-[#667085]">Save favorite products and come back any time.</p>
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link href="/" className="inline-flex h-14 items-center justify-center gap-3 rounded-[10px] bg-[#111827] px-10 text-[18px] font-black text-white transition hover:bg-[#ef3338]">
            <Icon name="cart" className="size-5" />
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
