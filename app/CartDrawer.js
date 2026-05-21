"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function parsePrice(price) {
  const match = String(price).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function formatPrice(value) {
  return `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Icon({ name, className = "size-5" }) {
  const icons = {
    cart: "M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.6L5 3H2m7 17a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01",
    close: "M18 6 6 18M6 6l12 12",
    trash: "M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5M14 11v5",
    truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    badge: "M12 3 19 6v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z",
    card: "M3 6h18v12H3zM3 10h18",
    award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3 0-1 6 4-2 4 2-1-6",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function ProductImage({ product }) {
  if (!product) {
    return null;
  }

  return (
    <div
      className={`size-[74px] shrink-0 rounded-[10px] bg-white bg-no-repeat ${
        product.image ? "bg-cover bg-center" : `bg-[url('/products-reference.png')] bg-[length:720px_338px] ${product.crop || "bg-center"}`
      }`}
      style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
    />
  );
}

export default function CartDrawer({ product, open, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const unitPrice = parsePrice(product?.price || 0);
  const subtotal = useMemo(() => unitPrice * quantity, [quantity, unitPrice]);

  if (!open || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="absolute inset-0 cursor-default bg-black/42 backdrop-blur-[7px]" aria-label="Close cart" onClick={onClose} />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[448px] flex-col bg-white shadow-[-22px_0_44px_rgba(15,23,42,0.18)]">
        <header className="flex h-[98px] items-center justify-between border-b border-[#eef1f5] px-6">
          <div className="flex items-center gap-4">
            <span className="grid size-10 place-items-center rounded-[11px] bg-[#ef3338] text-white">
              <Icon name="cart" className="size-5" />
            </span>
            <h2 className="text-[18px] font-black text-[#111827]">Shopping Cart (1)</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-[#667085] transition hover:bg-[#f3f4f6] hover:text-[#111827]" aria-label="Close cart">
            <Icon name="close" className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-6 flex min-h-[44px] items-center gap-2 rounded-[8px] bg-[#eaf3ff] px-4 text-[15px] font-semibold text-[#123edb]">
            <Icon name="truck" className="size-4" />
            You qualify for free shipping!
          </div>

          <article className="rounded-[10px] bg-[#fafafa] p-4">
            <div className="flex items-start gap-4">
              <ProductImage product={product} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-[#111827]">{product.name}</h3>
                    <p className="mt-2 text-[12px] font-bold uppercase text-[#7b8495]">{product.brand || product.category}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">• Default Title</p>
                  </div>
                  <button type="button" className="shrink-0 text-[#ef3338] transition hover:text-[#b91c1c]" aria-label="Remove item">
                    <Icon name="trash" className="size-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="flex h-[38px] min-w-[108px] items-center justify-between rounded-[7px] border border-[#d6dce5] bg-white px-2 text-[15px]">
                    <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid size-7 place-items-center text-[#9aa3b2] hover:text-[#ef3338]" aria-label="Decrease quantity">
                      −
                    </button>
                    <span className="font-semibold text-[#111827]">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid size-7 place-items-center text-[#7b8495] hover:text-[#ef3338]" aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-black text-[#111827]">{formatPrice(subtotal)}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">{formatPrice(unitPrice)} each</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="mt-6 grid grid-cols-3 rounded-[10px] bg-[#fff0f0] px-4 py-5 text-center text-[#8b3300]">
            {[
              ["award", "Authenticity", "Guaranteed"],
              ["badge", "Secure Payment", ""],
              ["truck", "Fast Ship", ""],
            ].map(([icon, title, line]) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <Icon name={icon} className="size-6 text-[#ef3338]" />
                <p className="text-[12px] leading-4">
                  {title}
                  {line && <span className="block">{line}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        <footer className="border-t border-[#e5e7eb] px-6 py-6">
          <div className="space-y-4 text-[14px] text-[#4b5563]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#111827]">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-[#079347]">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-semibold text-[#111827]">৳0.00</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-[#d7dce4] pt-4 text-[17px] font-black text-[#111827]">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <button type="button" className="mt-7 flex h-[54px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#ef3338] text-[15px] font-black text-white shadow-[0_12px_24px_rgba(220,38,38,0.22)] transition hover:bg-[#d3191d]">
            <Icon name="card" className="size-5" />
            Secure Checkout
          </button>
          <Link href="/cart" onClick={onClose} className="mt-3 flex h-[54px] w-full items-center justify-center rounded-[10px] border-2 border-[#ef3338] bg-white text-[16px] font-semibold text-[#ef3338] transition hover:bg-[#fff5f5]">
            View Full Cart
          </Link>

          <p className="mt-5 flex items-center justify-center gap-2 text-[12px] text-[#7b8495]">
            <Icon name="lock" className="size-4" />
            Secure SSL Encrypted Checkout
          </p>
        </footer>
      </aside>
    </div>
  );
}
