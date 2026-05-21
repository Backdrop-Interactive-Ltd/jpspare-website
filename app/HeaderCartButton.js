"use client";

import { useState } from "react";
import CartDrawer from "./CartDrawer";

const headerCartProduct = {
  name: "TOKICO Front Left Shock Absorber B3337",
  price: "Tk 4,680.00",
  brand: "TOKICO",
  category: "SUSPENSION",
  crop: "bg-[-494px_-15px]",
};

function CartIcon({ className = "size-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6h15l-1.5 8.5H8L6 3H3m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}

export default function HeaderCartButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open shopping cart" className="header-action-icon relative">
        <CartIcon />
        <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#111827] text-[11px] font-black leading-none text-white">1</span>
      </button>
      <CartDrawer product={headerCartProduct} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
