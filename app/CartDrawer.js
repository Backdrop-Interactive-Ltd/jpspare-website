"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

function formatPrice(value) {
  return `৳${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function Icon({ name, className = "size-5" }) {
  const icons = {
    cart: "M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.6L5 3H2m7 17a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01",
    close: "M18 6 6 18M6 6l12 12",
    trash: "M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5M14 11v5",
    truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    bag: "M6 8h12l-1 12H7L6 8Zm3 0a3 3 0 0 1 6 0M9 12h.01M15 12h.01",
    badge: "M12 3 19 6v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z",
    card: "M3 6h18v12H3zM3 10h18",
    award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3 0-1 6 4-2 4 2-1-6",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
    clipboard: "M9 4h6M9 4a2 2 0 0 0-2 2v1h10V6a2 2 0 0 0-2-2M7 7H5v14h14V7h-2M8 12h8M8 16h5",
    tag: "M20 13 13 20 4 11V4h7l9 9ZM7.5 7.5h.01",
    eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    chevronLeft: "m15 18-6-6 6-6",
    chevronRight: "m9 18 6-6-6-6",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function ProductImage({ item }) {
  const href = item.slug ? `/products/${item.slug}` : null;
  const image = (
    <div className="size-[84px] shrink-0 overflow-hidden rounded-[11px] bg-transparent">
      <img src={item.image || item.thumbnail || "/jpspare-logo.png"} alt={item.title} className="size-full object-cover transition duration-300 hover:scale-105" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0" aria-label={`View ${item.title}`}>
        {image}
      </Link>
    );
  }

  return (
    image
  );
}

const alsoBoughtProducts = [
  {
    title: "Chevron Techron Fuel System Cleaner",
    price: 1650,
    regularPrice: 2320,
    category: "Engine Parts",
    brand: "Chevron",
    freeDelivery: true,
    image: "/products-reference.png",
    href: "/products",
  },
  {
    title: "Liqui Moly Engine Flush Plus",
    price: 850,
    regularPrice: 1120,
    category: "Engine Oil",
    brand: "Liqui Moly",
    freeDelivery: false,
    image: "/products-reference.png",
    href: "/products",
  },
  {
    title: "Philips CR1632 3V Battery",
    price: 350,
    regularPrice: 430,
    category: "Electrical Parts",
    brand: "Philips",
    freeDelivery: false,
    image: "/products-reference.png",
    href: "/products",
  },
  {
    title: "Premium Engine Air Filter Replacement",
    price: 1250,
    regularPrice: 1645,
    category: "Filter",
    brand: "Premium",
    freeDelivery: true,
    image: "/products-reference.png",
    href: "/products",
  },
  {
    title: "Emergency Tyre Repair Kit Compact",
    price: 1850,
    regularPrice: 2342,
    category: "Tyre Care",
    brand: "Emergency",
    freeDelivery: false,
    image: "/products-reference.png",
    href: "/products",
  },
  {
    title: "Moxom Wide-Angle Rotating Car Holder",
    price: 1250,
    regularPrice: 1488,
    category: "Phone Accessories",
    brand: "Moxom",
    freeDelivery: true,
    image: "/products-reference.png",
    href: "/products",
  },
];

function getDiscountPercent(price, regularPrice) {
  if (!regularPrice || regularPrice <= price) return null;
  return Math.round(((regularPrice - price) / regularPrice) * 100);
}

export default function CartDrawer({ open, onClose }) {
  const drawerRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsReminder, setTermsReminder] = useState(false);
  const [cursorClose, setCursorClose] = useState({ visible: false, x: 0, y: 0 });
  const [isPending, startTransition] = useTransition();
  const subtotal = useMemo(() => Number(cart.subtotal || 0), [cart.subtotal]);
  const orderDiscount = useMemo(() => Number(cart.discount || cart.discountTotal || 0), [cart.discount, cart.discountTotal]);
  const regularSubtotal = useMemo(() => {
    return (cart.items || []).reduce((sum, item) => {
      const regularLineTotal = Number(item.regularLineTotal || 0);
      const lineTotal = Number(item.lineTotal || 0);
      return sum + (regularLineTotal > lineTotal ? regularLineTotal : lineTotal);
    }, 0);
  }, [cart.items]);
  const productDiscount = useMemo(() => {
    return (cart.items || []).reduce((sum, item) => {
      const regularLineTotal = Number(item.regularLineTotal || 0);
      const lineTotal = Number(item.lineTotal || 0);
      return regularLineTotal > lineTotal ? sum + (regularLineTotal - lineTotal) : sum;
    }, 0);
  }, [cart.items]);
  const discount = productDiscount + orderDiscount;
  const freeShippingThreshold = 5000;
  const hasFreeDeliveryItem = useMemo(() => {
    return (cart.items || []).some((item) => item.freeDelivery || item.freeDeliveryEligible);
  }, [cart.items]);
  const shippingCost = useMemo(() => {
    if (!subtotal || subtotal >= freeShippingThreshold || hasFreeDeliveryItem) return 0;
    return 60;
  }, [hasFreeDeliveryItem, subtotal]);
  const total = useMemo(() => Math.max(0, regularSubtotal - discount + shippingCost), [discount, regularSubtotal, shippingCost]);
  const BONUS_POINTS_THRESHOLD = 5000;
  const BONUS_POINTS_AMOUNT = 20;
  const freeDeliveryUnlocked = hasFreeDeliveryItem;
  const freeDeliveryRemaining = subtotal >= freeShippingThreshold ? 0 : Math.max(0, freeShippingThreshold - subtotal);
  const bonusPointsRemaining = subtotal >= BONUS_POINTS_THRESHOLD ? 0 : Math.max(0, BONUS_POINTS_THRESHOLD - subtotal);
  const rewardProgressTarget = freeDeliveryUnlocked ? BONUS_POINTS_THRESHOLD : freeShippingThreshold;
  const rewardProgress = Math.min(100, Math.round((subtotal / rewardProgressTarget) * 100));
  const alsoBoughtProduct = alsoBoughtProducts[recommendationIndex] || alsoBoughtProducts[0];
  const alsoBoughtDiscount = getDiscountPercent(alsoBoughtProduct.price, alsoBoughtProduct.regularPrice);

  function slideRecommendation(direction) {
    setRecommendationIndex((current) => (current + direction + alsoBoughtProducts.length) % alsoBoughtProducts.length);
  }

  function handleTermsChange(event) {
    setAcceptedTerms(event.target.checked);
    if (event.target.checked) setTermsReminder(false);
  }

  function handleSecureCheckout(event) {
    if (acceptedTerms) {
      onClose();
      return;
    }

    event.preventDefault();
    setTermsReminder(false);
    window.requestAnimationFrame(() => setTermsReminder(true));
  }

  function handleDrawerMouseMove(event) {
    const drawerRect = drawerRef.current?.getBoundingClientRect();

    if (drawerRect && event.clientX >= drawerRect.left) {
      setCursorClose((current) => current.visible ? { ...current, visible: false } : current);
      return;
    }

    setCursorClose({ visible: true, x: event.clientX, y: event.clientY });
  }

  function handleCartWheel(event) {
    const drawerRect = drawerRef.current?.getBoundingClientRect();

    if (!drawerRect || event.clientX < drawerRect.left) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    scrollAreaRef.current?.scrollBy({ top: event.deltaY, behavior: "auto" });
  }

  useEffect(() => {
    if (!open) return undefined;

    window.addEventListener("wheel", handleCartWheel, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", handleCartWheel, { capture: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open || alsoBoughtProducts.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setRecommendationIndex((current) => (current + 1) % alsoBoughtProducts.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [open]);

  async function loadCart() {
    setLoading(true);
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) loadCart();
  }, [open]);

  useEffect(() => {
    const handler = (event) => {
      if (event.detail) setCart(event.detail);
      else loadCart();
    };
    window.addEventListener("jpspare-cart-change", handler);
    return () => window.removeEventListener("jpspare-cart-change", handler);
  }, []);

  function updateItem(itemId, quantity) {
    startTransition(async () => {
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
    });
  }

  function removeItem(itemId) {
    startTransition(async () => {
      const response = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        window.dispatchEvent(new CustomEvent("jpspare-cart-change", { detail: data.cart }));
      }
    });
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-label="Shopping cart" onMouseMove={handleDrawerMouseMove} onMouseLeave={() => setCursorClose((current) => ({ ...current, visible: false }))}>
      <button type="button" className="absolute inset-0 cursor-default bg-[#101827]/58 backdrop-blur-[8px]" aria-label="Close cart" onClick={onClose} />

      {cursorClose.visible ? (
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto fixed z-[1002] grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ef3338] text-white shadow-[0_14px_28px_rgba(239,51,56,0.32)] transition hover:scale-105 hover:bg-[#d91f24]"
          style={{ left: cursorClose.x, top: cursorClose.y }}
          aria-label="Close cart"
        >
          <Icon name="close" className="size-4" />
        </button>
      ) : null}

      <aside ref={drawerRef} className="absolute right-0 top-0 flex h-full w-full max-w-[468px] flex-col overflow-hidden border-l border-white/70 bg-[#f4f6f9] shadow-[-24px_0_60px_rgba(15,23,42,0.22)]">
        <header className="relative flex h-[104px] items-center justify-between overflow-hidden border-b border-[#e5eaf1] bg-white px-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[#ef3338]" />
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-[12px] bg-[#ef3338] text-white shadow-[0_14px_28px_rgba(239,51,56,0.24)]">
              <Icon name="cart" className="size-5" />
            </span>
            <div>
              <h2 className="text-[20px] font-black tracking-[-0.02em] text-[#111827]">Shopping Cart ({cart.count || 0})</h2>
              <p className="mt-1 text-[12px] font-semibold text-[#7b8495]">Review items before checkout</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-[#e5eaf1] bg-white text-[#667085] transition hover:border-[#ef3338] hover:text-[#ef3338]" aria-label="Close cart">
            <Icon name="close" className="size-5" />
          </button>
        </header>

        <div ref={scrollAreaRef} className={`flex-1 overflow-y-auto px-6 py-6 ${!loading && !cart.items.length ? "flex items-center" : ""}`}>
          {cart.items.length ? (
          <div className="mb-5 rounded-[12px] border border-dashed border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-black text-[#111827]">
                {!freeDeliveryUnlocked ? (
                  <>🏆 Almost there! Add <span className="text-[#ef3338]">{formatPrice(freeDeliveryRemaining)}</span> more to unlock FREE Delivery.</>
                ) : bonusPointsRemaining > 0 ? (
                  <>
                    <span className="block text-[#079347]">🚚 FREE Delivery unlocked!</span>
                    <span className="block">🎁 You're only <span className="text-[#ef3338]">{formatPrice(bonusPointsRemaining)}</span> away from earning {BONUS_POINTS_AMOUNT} Bonus Points.</span>
                  </>
                ) : (
                  <>
                    <span className="block text-[#079347]">🚚 FREE Delivery unlocked!</span>
                    <span className="block">🎁 {BONUS_POINTS_AMOUNT} Bonus Points earned!</span>
                  </>
                )}
              </p>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf5ff] text-[#1143d8]">
                <Icon name="truck" className="size-4" />
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e5e9ef]">
              <div
                className="relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,#22c55e,#16a34a)] transition-all duration-500"
                style={{ width: `${rewardProgress}%` }}
              >
                <span className="cart-progress-wave absolute inset-y-0 left-0 w-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)]" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-[#8a94a5]">
              <span>{formatPrice(subtotal)}</span>
              <span>{formatPrice(rewardProgressTarget)}</span>
            </div>
          </div>
          ) : null}

          {loading ? <p className="py-10 text-center text-sm font-bold text-[#667085]">Loading cart...</p> : null}

          {!loading && !cart.items.length ? (
            <div className="w-full rounded-[14px] bg-white px-7 py-12 text-center shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
              <span className="mx-auto grid size-16 place-items-center rounded-[14px] text-[#c6ccd5]">
                <Icon name="bag" className="size-14" />
              </span>
              <p className="mt-5 text-[18px] font-black text-[#111827]">Your cart is empty</p>
              <p className="mx-auto mt-3 max-w-[320px] text-[16px] font-medium leading-7 text-[#667085]">Add some authentic Japanese auto parts to get started</p>
              <Link href="/products" onClick={onClose} className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#ef3338] px-7 text-[16px] font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#111827]">
                Browse Products
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : null}

          {cart.items.length ? (
          <div className="overflow-hidden rounded-[14px] border border-[#e7ecf3] bg-white">
            {cart.items.map((item) => (
              <article key={item.id} className="border-b border-[#edf1f6] p-4 transition last:border-b-0 hover:bg-[#fffafa]">
                <div className="flex items-start gap-3.5">
                  <ProductImage item={item} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {item.slug ? (
                          <Link href={`/products/${item.slug}`} className="product-card-title block line-clamp-2 max-w-[210px] text-[16px] font-extrabold leading-[1.25] !text-[#111827] transition hover:!text-[#ef3338]">
                            {item.title || item.name || "JPSPARE Product"}
                          </Link>
                        ) : (
                          <h3 className="product-card-title line-clamp-2 max-w-[210px] text-[16px] font-extrabold leading-[1.25] !text-[#111827]">{item.title || item.name || "JPSPARE Product"}</h3>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {item.brand || item.brandName ? (
                            <span className="rounded-[5px] bg-[#f25a1d] px-2 py-1 text-[9px] font-black uppercase leading-none text-white">{item.brand || item.brandName}</span>
                          ) : null}
                          {item.freeDelivery || item.freeDeliveryEligible ? (
                            <span className="rounded-[5px] bg-[#ff8a00] px-2 py-1 text-[9px] font-black leading-none text-white">Free Delivery</span>
                          ) : null}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="grid size-9 shrink-0 place-items-center rounded-[9px] border border-[#ffd2d4] bg-[#fff1f1] text-[#ef3338] shadow-[0_8px_18px_rgba(239,51,56,0.10)] transition hover:border-[#ef3338] hover:bg-[#ef3338] hover:text-white" aria-label="Remove item">
                        <Icon name="trash" className="size-[18px]" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="grid h-[34px] min-w-[96px] grid-cols-3 overflow-hidden rounded-[8px] border border-[#d6dce5] bg-[#f8fafc] text-[14px]">
                        <button disabled={isPending} type="button" onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} className="grid place-items-center text-[#9aa3b2] transition hover:bg-[#ef3338] hover:text-white active:bg-[#d91f24]" aria-label="Decrease quantity">−</button>
                        <span className="grid place-items-center font-semibold text-[#111827]">{item.quantity}</span>
                        <button disabled={isPending} type="button" onClick={() => updateItem(item.id, item.quantity + 1)} className="grid place-items-center text-[#7b8495] transition hover:bg-[#ef3338] hover:text-white active:bg-[#d91f24]" aria-label="Increase quantity">+</button>
                      </div>
                      <div className="text-right">
                        <div className="inline-block text-left">
                          <p className="product-price-display text-[24px] leading-none text-[#ef171d]">{formatPrice(item.lineTotal)}</p>
                        {item.regularLineTotal ? (
                          <div className="mt-1.5 flex items-center gap-2">
                            <p className="product-price-old text-[16px] leading-none text-[#9ca3af] line-through">{formatPrice(item.regularLineTotal)}</p>
                            <span className="rounded-[5px] bg-[#fff0e9] px-1.5 py-[3px] text-[9px] font-black leading-none text-[#ef3338]">-{getDiscountPercent(item.lineTotal, item.regularLineTotal)}%</span>
                          </div>
                        ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          ) : null}

          {cart.items.length ? (
          <section className="mt-5 overflow-hidden rounded-[14px] border border-[#e7ecf3] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
            <header className="border-b border-[#edf1f6] bg-[#f8fafc] px-5 py-3 text-center">
              <h3 className="text-[16px] font-black text-[#111827]">Customers also bought</h3>
            </header>
            <div key={recommendationIndex} className="cart-recommendation-slide flex items-center gap-4 px-5 py-4">
              <Link href={alsoBoughtProduct.href} className="size-[74px] shrink-0 overflow-hidden rounded-[10px] bg-[#f4f6f9]" aria-label={`View ${alsoBoughtProduct.title}`}>
                <img src={alsoBoughtProduct.image} alt={alsoBoughtProduct.title} className="size-full object-cover transition hover:scale-105" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={alsoBoughtProduct.href} className="block line-clamp-1 text-[14px] font-black leading-[1.25] !text-[#111827] transition hover:!text-[#ef3338]">
                  {alsoBoughtProduct.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-[5px] bg-[#f25a1d] px-2 py-1 text-[9px] font-black uppercase leading-none text-white">{alsoBoughtProduct.brand}</span>
                  {alsoBoughtProduct.freeDelivery ? (
                    <span className="rounded-[5px] bg-[#ff8a00] px-2 py-1 text-[9px] font-black leading-none text-white">Free Delivery</span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <p className="product-price-display text-[18px] leading-none text-[#ef171d]">{formatPrice(alsoBoughtProduct.price)}</p>
                  {alsoBoughtProduct.regularPrice ? (
                    <p className="product-price-old pb-0.5 text-[11px] leading-none text-[#9ca3af] line-through">{formatPrice(alsoBoughtProduct.regularPrice)}</p>
                  ) : null}
                  {alsoBoughtDiscount ? (
                    <span className="rounded-[5px] bg-[#fff0e9] px-1.5 py-1 text-[9px] font-black leading-none text-[#ef3338]">-{alsoBoughtDiscount}%</span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex h-11 items-center justify-center gap-5">
              <button type="button" onClick={() => slideRecommendation(-1)} className="grid size-9 place-items-center rounded-full text-[#c3cad5] transition hover:bg-[#fff1f1] hover:text-[#ef3338]" aria-label="Previous recommended product">
                <Icon name="chevronLeft" className="size-5" />
              </button>
              <div className="flex items-center justify-center gap-2">
                {alsoBoughtProducts.map((product, dot) => (
                  <button
                    key={product.title}
                    type="button"
                    onClick={() => setRecommendationIndex(dot)}
                    className={
                      dot === recommendationIndex
                        ? "h-2.5 w-5 rounded-full bg-[#111827] shadow-[0_3px_8px_rgba(17,24,39,0.22)] transition-all duration-300"
                        : "size-2.5 rounded-full border border-[#cbd3df] bg-white transition-all duration-300 hover:border-[#ef3338] hover:bg-[#fff1f1]"
                    }
                    aria-label={`Show recommended product ${dot + 1}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => slideRecommendation(1)} className="grid size-9 place-items-center rounded-full text-[#9aa3b2] transition hover:bg-[#fff1f1] hover:text-[#ef3338]" aria-label="Next recommended product">
                <Icon name="chevronRight" className="size-5" />
              </button>
            </div>
          </section>
          ) : null}
        </div>

        <style>{`
          @keyframes cartRecommendationSlide {
            0% {
              opacity: 0;
              transform: translateX(34px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .cart-recommendation-slide {
            animation: cartRecommendationSlide 420ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          @keyframes cartTermsShake {
            0%, 100% {
              transform: translateX(0);
            }
            20%, 60% {
              transform: translateX(-5px);
            }
            40%, 80% {
              transform: translateX(5px);
            }
          }

          .cart-terms-reminder {
            animation: cartTermsShake 420ms ease;
          }
        `}</style>

        {cart.items.length ? (
        <footer className="border-t border-[#e0e6ee] bg-white px-6 py-4 shadow-[0_-18px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between text-[#111827]">
            <span className="product-card-title text-[18px] font-extrabold leading-none">Subtotal</span>
            <span className="product-price-display text-[20px] leading-none text-[#111827]">{formatPrice(regularSubtotal)}</span>
          </div>
          <div className="mt-3 space-y-2 text-[#111827]">
            <div className="flex items-center justify-between">
              <span className="product-card-title text-[14px] font-bold leading-none">Discount</span>
              <span className="product-price-display text-[15px] leading-none text-[#111827]">{formatPrice(discount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="product-card-title text-[14px] font-bold leading-none">Shipping Cost</span>
              <span className={shippingCost > 0 ? "product-price-display text-[15px] leading-none text-[#111827]" : "text-[15px] font-black leading-none text-[#079347]"}>{shippingCost > 0 ? formatPrice(shippingCost) : "Free"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#e5eaf1] pt-3">
              <span className="product-card-title text-[17px] font-extrabold leading-none">Total</span>
              <span className="product-price-display text-[25px] leading-none text-[#ef171d]">{formatPrice(total)}</span>
            </div>
          </div>
          <p className="mt-2 text-center text-[14px] font-normal text-[#6b7280]/70">
            Taxes and <span className="text-[#ef3338] underline decoration-[#ef3338] underline-offset-2">shipping</span> calculated at checkout
          </p>
          <label className={`mt-2 flex cursor-pointer items-center justify-center gap-2 text-center text-[13px] font-normal transition ${termsReminder ? "cart-terms-reminder text-[#ef3338]" : "text-[#6b7280]/70"}`}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={handleTermsChange}
              className="size-[15px] rounded-[2px] border border-[#e5e7eb] text-[#ef3338] accent-[#ef3338]"
            />
            <span>I agree with the terms and conditions</span>
          </label>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Link href="/checkout" onClick={handleSecureCheckout} className="flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[#ef3338] px-3 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(239,51,56,0.24)] transition hover:bg-[#d91f24]">
              <Icon name="card" className="size-5" />
              Secure Checkout
            </Link>
            <Link href="/cart" onClick={onClose} className="flex h-[48px] items-center justify-center rounded-[10px] border-2 border-[#111827] bg-[#111827] px-3 text-[14px] font-black text-white transition hover:border-[#ef3338] hover:bg-[#ef3338] hover:text-white">
              View Full Cart
            </Link>
          </div>

          <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#7b8495]">
            <Icon name="lock" className="size-4" />
            Secure SSL Encrypted Checkout
          </p>
        </footer>
        ) : null}
      </aside>
    </div>
  );
}
