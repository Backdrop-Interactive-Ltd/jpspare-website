"use client";

import { useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";

function CartIcon({ className = "size-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6h15l-1.5 8.5H8L6 3H3m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}

export default function HeaderCartButton() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCount() {
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok || !active) return;
      const data = await response.json();
      setCount(data.cart?.count || 0);
    }

    function handleCartChange(event) {
      if (event.detail?.count !== undefined) {
        setCount(event.detail.count);
      } else {
        loadCount();
      }
    }

    loadCount();
    window.addEventListener("jpspare-cart-change", handleCartChange);

    return () => {
      active = false;
      window.removeEventListener("jpspare-cart-change", handleCartChange);
    };
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open shopping cart" className="header-action-icon relative">
        <CartIcon />
        <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#ef3338] text-[11px] font-black leading-none text-white shadow-[0_6px_14px_rgba(239,51,56,0.35)]">{count}</span>
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
