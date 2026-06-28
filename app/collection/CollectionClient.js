"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function CollectionIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21 16-9 5-9-5" />
      <path d="m21 12-9 5-9-5" />
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
    </svg>
  );
}

function SearchIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ArrowIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function StarIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2.6Z" />
    </svg>
  );
}

function ToolIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6.1 6.1a2 2 0 1 0 2.8 2.8l6.1-6.1a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.8-2.8 2.4-2.4Z" />
    </svg>
  );
}

function CollectionCard({ collection, index }) {
  const href = `/collections/${encodeURIComponent(collection.slug)}`;
  const hasImage = Boolean(collection.image);

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[8px] border border-[#dfe4ea] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#ef3338]/60 hover:shadow-[0_26px_54px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-4 focus:ring-[#ef3338]/15"
    >
      <div
        className={[
          "relative grid aspect-[1.34] place-items-center overflow-hidden bg-[#858e99]",
          hasImage ? "bg-cover bg-center" : "",
        ].join(" ")}
        style={hasImage ? { backgroundImage: `url(${collection.image})` } : undefined}
      >
        <span className="absolute right-4 top-4 rounded-full bg-white px-4 py-1.5 text-[12px] font-black text-[#111827] shadow-[0_10px_22px_rgba(15,23,42,0.12)]">
          {collection.count} items
        </span>
        {hasImage ? <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-0 transition group-hover:opacity-100" /> : null}
        {!hasImage ? (
          <div className="grid place-items-center text-white">
            <CollectionIcon className="size-7" />
            <span className="mt-3 text-[16px] font-semibold">No Image</span>
          </div>
        ) : (
          <span className="translate-y-3 rounded-[7px] bg-white px-5 py-3 text-[16px] font-bold text-[#111827] opacity-0 shadow-[0_16px_30px_rgba(15,23,42,0.18)] transition group-hover:translate-y-0 group-hover:opacity-100">
            View Products
          </span>
        )}
      </div>

      <div className="relative min-h-[214px] px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="grid size-10 place-items-center rounded-[8px] bg-[#f8fafc] text-[#334155] transition group-hover:bg-[#fff1f1] group-hover:text-[#ef3338]">
            <CollectionIcon />
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#475569]">
            <StarIcon className="size-4 text-[#ef3338]" />
            {collection.rating}
          </span>
        </div>

        <h2 className="text-[20px] font-black leading-7 text-[#111827] transition group-hover:text-[#ef3338]">{collection.name}</h2>
        <p className="mt-3 line-clamp-2 text-[15px] leading-6 text-[#536174]">{collection.description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold text-[#ef3338]">
          Explore Collection
          <ArrowIcon />
        </span>
        <span className="absolute bottom-6 right-6 text-[#9aa4b2] transition group-hover:text-[#ef3338]">
          <ToolIcon />
        </span>
      </div>
    </Link>
  );
}

export default function CollectionClient({ collections, premiumParts }) {
  const [query, setQuery] = useState("");

  const filteredCollections = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return collections;
    return collections.filter((collection) => {
      return `${collection.name} ${collection.description}`.toLowerCase().includes(search);
    });
  }, [collections, query]);

  return (
    <main className="bg-[#f4f6f8] pb-20">
      <section className="relative mx-auto w-full max-w-[1635px] overflow-hidden bg-[#080c13] px-6 py-24 text-center text-white shadow-[0_20px_70px_rgba(15,23,42,0.10)] sm:px-10 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,#101827_0%,#080c13_58%,#210910_100%)]" />
        <div className="relative mx-auto max-w-[850px]">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#ef3338]/55 bg-[#ef3338]/18 px-6 py-3 text-[13px] font-black uppercase tracking-[0.14em] text-[#f5f20a]">
            <CollectionIcon className="size-4" />
            Automotive Collections
          </div>
          <h1 className="mt-10 text-[56px] font-black leading-[1.15] text-white max-md:text-[42px] max-sm:text-[34px]">
            Premium Japanese
            <span className="block text-[#ff4a4f]">Auto Parts Collections</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[760px] text-[22px] leading-9 text-white/75 max-sm:text-[17px] max-sm:leading-7">
            Explore authentic Japanese automotive parts, organized by category for faster browsing, better fitment, and confident buying.
          </p>
          <div className="mx-auto mt-14 grid max-w-[620px] grid-cols-3 gap-8 max-sm:gap-3">
            <div>
              <strong className="block text-[38px] font-black text-white max-sm:text-[28px]">{collections.length}</strong>
              <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/70">Collections</span>
            </div>
            <div>
              <strong className="block text-[38px] font-black text-white max-sm:text-[28px]">{premiumParts}+</strong>
              <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/70">Premium Parts</span>
            </div>
            <div>
              <strong className="block text-[38px] font-black text-white max-sm:text-[28px]">100%</strong>
              <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/70">Authentic</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1635px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-12 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="text-[34px] font-black tracking-[-0.02em] text-[#111827]">All Collections</h2>
            <p className="mt-3 text-[18px] text-[#536174]">Browse our complete range of automotive parts collections</p>
          </div>
          <label className="relative block w-full max-w-[330px] max-md:max-w-full">
            <span className="sr-only">Search collections</span>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#94a3b8]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 w-full rounded-[8px] border border-[#cfd6df] bg-white pl-12 pr-4 text-[16px] font-medium text-[#111827] outline-none transition placeholder:text-[#8b95a5] hover:border-[#ef3338] focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10"
              placeholder="Search collections..."
            />
          </label>
        </div>

        {filteredCollections.length ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredCollections.map((collection, index) => (
              <CollectionCard key={collection.id} collection={collection} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-[#dfe4ea] bg-white p-12 text-center">
            <p className="text-[18px] font-bold text-[#111827]">No collections found</p>
            <p className="mt-2 text-[#64748b]">Try a different keyword.</p>
          </div>
        )}

        <div className="mt-20 rounded-[8px] border border-[#f4d475] bg-[#fff6ed] px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff9b9d] bg-[#fff1f1] px-5 py-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#ef3338]">
            <ToolIcon />
            Expert Support
          </div>
          <h2 className="mt-7 text-[30px] font-black text-[#111827] max-sm:text-[24px]">Need Help Finding the Right Parts?</h2>
          <p className="mx-auto mt-4 max-w-[720px] text-[18px] leading-8 text-[#536174]">
            Our automotive experts can help you find the exact Japanese parts you need with compatibility guidance.
          </p>
          <div className="mt-8 flex justify-center gap-4 max-sm:flex-col">
            <Link href="/products" className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] bg-[#ef3338] px-8 text-[16px] font-bold text-white shadow-[0_18px_34px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f25]">
              Advanced Search
              <SearchIcon className="size-4" />
            </Link>
            <Link href="/help" className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] border border-[#ef3338] bg-white px-8 text-[16px] font-bold text-[#ef3338] transition hover:-translate-y-0.5 hover:bg-[#fff1f1]">
              Contact Expert
              <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
