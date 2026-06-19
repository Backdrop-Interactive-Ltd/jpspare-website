"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function HeartIcon({ className = "size-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export default function HeaderWishlistButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCount() {
      const response = await fetch("/api/wishlist", { cache: "no-store" });
      if (!response.ok || !active) return;
      const data = await response.json();
      setCount(Array.isArray(data.items) ? data.items.length : 0);
    }

    function handleWishlistChange(event) {
      if (typeof event.detail?.count === "number") {
        setCount(event.detail.count);
      } else {
        loadCount();
      }
    }

    loadCount();
    window.addEventListener("jpspare-wishlist-change", handleWishlistChange);

    return () => {
      active = false;
      window.removeEventListener("jpspare-wishlist-change", handleWishlistChange);
    };
  }, []);

  return (
    <Link href="/wishlisht" aria-label="Wishlist" className="header-action-icon relative">
      <HeartIcon />
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#ef3338] text-[11px] font-black leading-none text-white shadow-[0_6px_14px_rgba(239,51,56,0.35)]">{count}</span>
      ) : null}
    </Link>
  );
}
