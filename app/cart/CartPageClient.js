"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const paymentLabels = ["VISA", "MC", "AMEX", "bKash", "Nagad", "Rocket", "DBBL", "City", "MTB", "AB", "Upay", "SSL"];

function formatPrice(value = 0) {
  return `৳${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Icon({ name, className = "size-5" }) {
  const icons = {
    arrowLeft: "M19 12H5m6-6-6 6 6 6",
    arrowRight: "M5 12h14m-6-6 6 6-6 6",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    trash: "M3 6h18m-2 0-.8 14a2 2 0 0 1-2 2H7.8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 5v6m4-6v6",
    box: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.5 8.5 12 13l8.5-4.5M12 22v-9",
    receipt: "M6 2h12v20l-3-2-3 2-3-2-3 2V2Zm4 6h4m-4 4h5m-5 4h3",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3 0-1 6 4-2 4 2-1-6",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
    card: "M3 6h18v12H3zM3 10h18",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default function CartPageClient() {
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const subtotal = useMemo(() => Number(cart.subtotal || 0), [cart.subtotal]);

  async function loadCart() {
    setLoading(true);
    const response = await fetch("/api/cart", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setCart(data.cart || { items: [], subtotal: 0, count: 0 });
    }
    setLoading(false);
  }

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (response.ok) {
      const data = await response.json();
      setCart(data.cart);
      window.dispatchEvent(new CustomEvent("jpspare-cart-change", { detail: data.cart }));
    }
  }

  async function removeItem(itemId) {
    const response = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
    if (response.ok) {
      const data = await response.json();
      setCart(data.cart);
      window.dispatchEvent(new CustomEvent("jpspare-cart-change", { detail: data.cart }));
    }
  }

  async function clearCart() {
    const response = await fetch("/api/cart", { method: "DELETE" });
    if (response.ok) {
      const data = await response.json();
      setCart(data.cart);
      window.dispatchEvent(new CustomEvent("jpspare-cart-change", { detail: data.cart }));
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_18%,rgba(247,217,95,0.07),transparent_24%),radial-gradient(circle_at_86%_60%,rgba(239,51,56,0.06),transparent_28%),#ffffff] text-[#111827]">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/" className="inline-flex h-12 items-center gap-3 rounded-[9px] border border-[#dfe5ec] bg-white px-6 text-[15px] font-semibold text-[#4b5563] shadow-sm transition hover:border-[#ef3338] hover:text-[#ef3338]">
          <Icon name="arrowLeft" className="size-4" />
          Continue Shopping
        </Link>

        <div className="mt-14 flex items-end justify-between gap-8 max-lg:flex-col max-lg:items-start">
          <div className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-[9px] bg-[#ef3338] text-white shadow-[0_12px_24px_rgba(239,51,56,0.2)]">
              <Icon name="cart" />
            </span>
            <div>
              <h1 className="text-[34px] font-black tracking-[-0.04em]">
                Shopping Cart <span className="text-[#df171d]">({cart.count || 0})</span>
              </h1>
              <p className="mt-2 text-[15px] font-medium text-[#5f6878]">Review your items and checkout</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-[14px] font-semibold text-[#4b5563]">
            <span className="inline-flex items-center gap-2"><Icon name="shield" className="size-4 text-emerald-500" /> Secure</span>
            <span className="inline-flex items-center gap-2"><Icon name="truck" className="size-4 text-blue-500" /> Fast Ship</span>
            <span className="inline-flex items-center gap-2"><Icon name="award" className="size-4 text-[#ef3338]" /> Quality</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)_430px] gap-8 max-xl:grid-cols-1">
          <div>
            <div className="mb-4 flex min-h-[58px] items-center justify-between rounded-[10px] border border-[#dfe5ec] bg-white px-5 shadow-sm max-sm:flex-col max-sm:items-start max-sm:gap-3 max-sm:py-4">
              <p className="inline-flex items-center gap-3 text-[16px] font-semibold text-[#273142]">
                <Icon name="box" className="size-5 text-blue-600" />
                You qualify for free shipping!
              </p>
              <button type="button" onClick={clearCart} className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#ef3338] transition hover:text-[#111827]">
                <Icon name="trash" className="size-4" />
                Clear
              </button>
            </div>

            {loading ? (
              <div className="rounded-[10px] border border-[#dfe5ec] bg-white p-10 text-center font-bold text-[#667085]">Loading cart...</div>
            ) : cart.items?.length ? (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <article key={item.id} className="grid grid-cols-[140px_minmax(0,1fr)_230px] gap-8 rounded-[10px] border border-[#dfe5ec] bg-white p-6 shadow-sm max-lg:grid-cols-[120px_1fr] max-sm:grid-cols-1">
                    <Link href={item.slug ? `/products/${item.slug}` : "#"} className="h-[120px] rounded-[8px] bg-white bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${item.image || "/products-reference.png"})` }} aria-label={`View ${item.title}`} />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <Link href={item.slug ? `/products/${item.slug}` : "#"} className="line-clamp-2 text-[21px] font-black leading-tight text-[#111827] transition hover:text-[#ef3338]">
                          {item.title}
                        </Link>
                        <button type="button" onClick={() => removeItem(item.id)} className="hidden text-[#ef3338] transition hover:text-[#111827] max-lg:block" aria-label="Remove item">
                          <Icon name="trash" />
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-[#5f6878]">
                        {item.brand ? <span className="rounded-[6px] bg-[#f3f4f6] px-3 py-1 font-bold text-[#4b5563]">{item.brand}</span> : null}
                        <span>• Default Title</span>
                      </div>
                      <p className="mt-7 text-[13px] font-black uppercase tracking-[0.14em] text-[#4b5563]">Quantity</p>
                      <div className="mt-3 flex h-[52px] w-[170px] items-center justify-between rounded-[9px] border border-[#d7dde6] bg-white px-3 text-[18px]">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid size-9 place-items-center text-[#9aa3b2] transition hover:text-[#ef3338]">−</button>
                        <span className="font-black text-[#111827]">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid size-9 place-items-center text-[#667085] transition hover:text-[#ef3338]">+</button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between text-right max-lg:col-span-2 max-lg:flex-row max-lg:items-center max-sm:col-span-1 max-sm:flex-col max-sm:items-start max-sm:text-left">
                      <button type="button" onClick={() => removeItem(item.id)} className="text-[#ef3338] transition hover:text-[#111827] max-lg:hidden" aria-label="Remove item">
                        <Icon name="trash" />
                      </button>
                      <div>
                        <p className="text-[34px] font-black tracking-[-0.04em]">{formatPrice(item.lineTotal)}</p>
                        <p className="mt-2 text-[17px] text-[#6b7280]">{formatPrice(item.price)} each</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[10px] border border-[#dfe5ec] bg-white p-14 text-center shadow-sm">
                <h2 className="text-[28px] font-black">Your cart is empty</h2>
                <p className="mt-3 text-[#667085]">Add a product to begin checkout.</p>
              </div>
            )}
          </div>

          <aside className="h-fit overflow-hidden rounded-[10px] border border-[#dfe5ec] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <header className="flex min-h-[76px] items-center gap-4 border-b border-[#ecdfe2] bg-[#fff3f3] px-5">
              <span className="grid size-10 place-items-center rounded-[9px] bg-[#ef3338] text-white">
                <Icon name="receipt" className="size-5" />
              </span>
              <h2 className="text-[18px] font-black">Order Summary</h2>
            </header>
            <div className="p-5">
              <div className="space-y-5 text-[20px] text-[#273142]">
                <div className="flex justify-between gap-4"><span>Subtotal ({cart.count || 0} items)</span><span className="font-black">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between gap-4"><span>Shipping</span><span className="inline-flex items-center gap-1 font-black text-[#0a9f4a]"><Icon name="truck" className="size-4" /> Free</span></div>
                <div className="flex justify-between gap-4"><span>Tax</span><span className="font-black">৳0.00</span></div>
              </div>
              <div className="mt-6 flex justify-between border-t border-[#cfd5df] pt-6 text-[30px] font-black"><span>Total</span><span>{formatPrice(subtotal)}</span></div>

              <Link href="/checkout" className="mt-8 flex h-[60px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#ef3338] text-[20px] font-black text-white shadow-[0_14px_28px_rgba(239,51,56,0.22)] transition hover:bg-[#111827]">
                <Icon name="card" /> Secure Checkout <Icon name="arrowRight" />
              </Link>

              <div className="mt-7 flex h-[54px] items-center justify-center gap-3 rounded-[8px] bg-[#f8fafc] text-[15px] font-semibold text-[#4b5563]">
                <Icon name="lock" className="size-5 text-emerald-500" /> 256-bit SSL Secured Checkout
              </div>
              <p className="mt-7 text-center text-[15px] font-medium text-[#4b5563]">We accept</p>
              <div className="mt-4 rounded-[8px] border border-[#e5e7eb] bg-white p-3">
                <p className="mb-3 text-[11px] font-bold text-[#6b7280]">Payment Channels</p>
                <div className="grid grid-cols-4 gap-2">
                  {paymentLabels.map((label) => (
                    <span key={label} className="grid h-9 place-items-center rounded-[4px] border border-[#dfe5ec] bg-[#f8fafc] text-[10px] font-black text-[#273142]">{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
