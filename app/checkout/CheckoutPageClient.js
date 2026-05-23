"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const paymentMethods = [
  { value: "CASH_ON_DELIVERY", title: "Cash on Delivery", detail: "Pay when your parts arrive" },
  { value: "SSLCOMMERZ", title: "SSLCommerz", detail: "Card, bank, and mobile payment ready" },
  { value: "BKASH", title: "bKash", detail: "Mobile wallet structure ready" },
  { value: "NAGAD", title: "Nagad", detail: "Mobile wallet structure ready" },
];

function formatPrice(value = 0) {
  return `৳${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Icon({ name, className = "size-5" }) {
  const icons = {
    arrowLeft: "M19 12H5m6-6-6 6 6 6",
    arrowRight: "M5 12h14m-6-6 6 6-6 6",
    box: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.5 8.5 12 13l8.5-4.5M12 22v-9",
    card: "M3 6h18v12H3zM3 10h18",
    check: "M20 6 9 17l-5-5",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
    truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function Field({ label, name, value, onChange, required = false, type = "text", placeholder = "", className = "", error = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[13px] font-black uppercase tracking-[0.12em] text-[#374151]">
        {label} {required ? <span className="text-[#ef3338]">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        className={`mt-2 h-12 w-full rounded-[9px] border bg-white px-4 text-[15px] font-medium text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10 ${error ? "border-[#ef3338]" : "border-[#d7dde6]"}`}
      />
      {error ? <span className="mt-2 block text-[12px] font-bold text-[#c8191f]">{error}</span> : null}
    </label>
  );
}

export default function CheckoutPageClient() {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "Dhaka",
    area: "",
    postalCode: "",
    country: "Bangladesh",
    notes: "",
    couponCode: "",
    paymentMethod: "CASH_ON_DELIVERY",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [order, setOrder] = useState(null);

  const deliveryCharge = useMemo(() => (Number(cart.subtotal || 0) >= 5000 || Number(cart.subtotal || 0) === 0 ? 0 : 120), [cart.subtotal]);
  const total = useMemo(() => Number(cart.subtotal || 0) + deliveryCharge, [cart.subtotal, deliveryCharge]);

  useEffect(() => {
    async function loadCheckout() {
      const [cartResponse, accountResponse] = await Promise.all([
        fetch("/api/cart", { cache: "no-store" }),
        fetch("/api/auth/me", { cache: "no-store" }),
      ]);

      if (cartResponse.ok) {
        const data = await cartResponse.json();
        setCart(data.cart || { items: [], subtotal: 0, count: 0 });
      }

      if (accountResponse.ok) {
        const data = await accountResponse.json();
        const customer = data.customer;
        const address = customer?.addresses?.find((item) => item.isDefault) || customer?.addresses?.[0];
        setForm((current) => ({
          ...current,
          fullName: customer?.name || [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || current.fullName,
          email: customer?.email || current.email,
          phone: customer?.phone || address?.phone || current.phone,
          addressLine1: address?.addressLine1 || current.addressLine1,
          addressLine2: address?.addressLine2 || current.addressLine2,
          city: address?.city || current.city,
          area: address?.zone || current.area,
          postalCode: address?.postalCode || current.postalCode,
          country: address?.country || current.country,
        }));
      }

      setLoading(false);
    }

    loadCheckout();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setFieldErrors({});

    const address = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      city: form.city,
      area: form.area,
      postalCode: form.postalCode,
      country: form.country,
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billingAddress: address,
        shippingAddress: address,
        notes: form.notes,
        couponCode: form.couponCode,
        paymentMethod: form.paymentMethod,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setOrder(data.order);
      setCart({ items: [], subtotal: 0, count: 0 });
      window.dispatchEvent(new CustomEvent("jpspare-cart-change", { detail: { items: [], subtotal: 0, count: 0 } }));
      const redirectUrl = data.redirectUrl || `/checkout/success/${data.order?.orderNumber}`;
      if (data.payment?.gateway === "SSLCOMMERZ" || redirectUrl.startsWith("http") || redirectUrl.startsWith("/api/payments/")) {
        window.location.assign(redirectUrl);
        return;
      }
      router.push(redirectUrl);
    } else {
      setFieldErrors(data.fieldErrors || {});
      setMessage(data.error || "We could not place this order. Please review your details and try again.");
    }

    setSubmitting(false);
  }

  if (order) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-16 text-[#111827]">
        <section className="mx-auto max-w-[760px] rounded-[16px] border border-[#dfe5ec] bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <Icon name="check" className="size-8" />
          </span>
          <h1 className="mt-6 text-[38px] font-black tracking-[-0.04em]">Order placed successfully</h1>
          <p className="mt-3 text-[17px] text-[#5f6878]">Your JPSPARE order number is <span className="font-black text-[#ef3338]">{order.orderNumber}</span>.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href="/account/orders" className="flex h-13 items-center justify-center rounded-[9px] bg-[#ef3338] px-5 font-black text-white transition hover:bg-[#111827]">View My Orders</Link>
            <Link href="/" className="flex h-13 items-center justify-center rounded-[9px] border border-[#dfe5ec] px-5 font-black text-[#273142] transition hover:border-[#ef3338] hover:text-[#ef3338]">Continue Shopping</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_14%_20%,rgba(247,217,95,0.07),transparent_24%),radial-gradient(circle_at_86%_60%,rgba(239,51,56,0.06),transparent_28%),#ffffff] text-[#111827]">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[15px] font-black text-[#4b5563] transition hover:text-[#ef3338]">
          <Icon name="arrowLeft" className="size-4" />
          Back to cart
        </Link>

        <div className="mt-8 flex items-end justify-between gap-6 max-lg:flex-col max-lg:items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#fecaca] bg-[#fff1f1] px-5 py-2 text-[13px] font-black uppercase tracking-[0.12em] text-[#c8191f]">
              <Icon name="lock" className="size-4" />
              Secure Checkout
            </span>
            <h1 className="mt-5 text-[46px] font-black tracking-[-0.04em] max-sm:text-[34px]">Complete Your <span className="text-[#ef3338]">Order</span></h1>
            <p className="mt-2 text-[18px] text-[#5f6878]">Billing, shipping, and payment details for your JPSPARE parts.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-[14px] font-semibold text-[#4b5563]">
            <span className="inline-flex items-center gap-2"><Icon name="lock" className="size-4 text-emerald-500" /> Secure</span>
            <span className="inline-flex items-center gap-2"><Icon name="truck" className="size-4 text-blue-500" /> Fast Ship</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-[minmax(0,1fr)_430px] gap-8 max-xl:grid-cols-1">
          <div className="space-y-6">
            <section className="rounded-[14px] border border-[#dfe5ec] bg-white p-6 shadow-sm">
              <h2 className="text-[22px] font-black">Billing & Shipping Details</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Your full name" error={fieldErrors.fullName} />
                <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="017XXXXXXXX" error={fieldErrors.phone} />
                <Field label="Email Address" name="email" value={form.email} onChange={handleChange} required type="email" placeholder="you@example.com" className="sm:col-span-2" error={fieldErrors.email} />
                <Field label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={handleChange} required placeholder="House, road, area" className="sm:col-span-2" error={fieldErrors.addressLine1} />
                <Field label="Address Line 2" name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Apartment, floor, landmark" className="sm:col-span-2" />
                <Field label="City" name="city" value={form.city} onChange={handleChange} required error={fieldErrors.city} />
                <Field label="Area" name="area" value={form.area} onChange={handleChange} placeholder="Tejgaon" />
                <Field label="Post Code" name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="1208" />
                <Field label="Country" name="country" value={form.country} onChange={handleChange} required error={fieldErrors.country} />
              </div>
            </section>

            <section className="rounded-[14px] border border-[#dfe5ec] bg-white p-6 shadow-sm">
              <h2 className="text-[22px] font-black">Order Notes & Coupon</h2>
              <div className="mt-6 grid gap-5">
                <label className="block">
                  <span className="text-[13px] font-black uppercase tracking-[0.12em] text-[#374151]">Order Notes</span>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="Vehicle details, delivery instruction, or special request" className="mt-2 w-full rounded-[9px] border border-[#d7dde6] bg-white px-4 py-3 text-[15px] font-medium text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10" />
                </label>
                <Field label="Coupon Code" name="couponCode" value={form.couponCode} onChange={handleChange} placeholder="JPSPARE15" />
              </div>
            </section>

            <section className="rounded-[14px] border border-[#dfe5ec] bg-white p-6 shadow-sm">
              <h2 className="text-[22px] font-black">Payment Method</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <label key={method.value} className={`cursor-pointer rounded-[12px] border p-4 transition ${form.paymentMethod === method.value ? "border-[#ef3338] bg-[#fff4f4] shadow-[0_12px_28px_rgba(239,51,56,0.08)]" : "border-[#dfe5ec] bg-white hover:border-[#f7d95f]"}`}>
                    <input type="radio" name="paymentMethod" value={method.value} checked={form.paymentMethod === method.value} onChange={handleChange} className="sr-only" />
                    <span className="flex items-start gap-3">
                      <span className={`mt-1 grid size-5 place-items-center rounded-full border ${form.paymentMethod === method.value ? "border-[#ef3338] bg-[#ef3338] text-white" : "border-[#cfd5df]"}`}>
                        {form.paymentMethod === method.value ? <Icon name="check" className="size-3" /> : null}
                      </span>
                      <span>
                        <span className="block text-[16px] font-black">{method.title}</span>
                        <span className="mt-1 block text-[13px] font-medium text-[#667085]">{method.detail}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit overflow-hidden rounded-[14px] border border-[#dfe5ec] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <header className="flex min-h-[76px] items-center gap-4 border-b border-[#ecdfe2] bg-[#fff3f3] px-5">
              <span className="grid size-10 place-items-center rounded-[9px] bg-[#ef3338] text-white">
                <Icon name="box" className="size-5" />
              </span>
              <h2 className="text-[18px] font-black">Order Summary</h2>
            </header>
            <div className="p-5">
              {loading ? (
                <div className="py-8 text-center font-bold text-[#667085]">Loading cart...</div>
              ) : cart.items?.length ? (
                <div className="max-h-[320px] space-y-4 overflow-auto pr-1">
                  {cart.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-[#eef2f6] pb-4 last:border-0">
                      <div className="h-16 rounded-[8px] bg-[#f8fafc] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${item.image || "/products-reference.png"})` }} />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[14px] font-black text-[#111827]">{item.title}</p>
                        <p className="mt-1 text-[12px] text-[#667085]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[14px] font-black text-[#ef3338]">{formatPrice(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="font-black">Your cart is empty</p>
                  <Link href="/" className="mt-3 inline-flex text-sm font-bold text-[#ef3338]">Continue shopping</Link>
                </div>
              )}

              <div className="mt-6 space-y-4 text-[17px] text-[#273142]">
                <div className="flex justify-between gap-4"><span>Subtotal ({cart.count || 0} items)</span><span className="font-black">{formatPrice(cart.subtotal)}</span></div>
                <div className="flex justify-between gap-4"><span>Delivery</span><span className="font-black text-[#0a9f4a]">{deliveryCharge ? formatPrice(deliveryCharge) : "Free"}</span></div>
                <div className="flex justify-between gap-4"><span>Tax</span><span className="font-black">৳0.00</span></div>
              </div>
              <div className="mt-6 flex justify-between border-t border-[#cfd5df] pt-6 text-[28px] font-black"><span>Total</span><span>{formatPrice(total)}</span></div>

              {message ? <p className="mt-5 rounded-[9px] bg-[#fff1f1] px-4 py-3 text-sm font-bold text-[#c8191f]">{message}</p> : null}

              <button type="submit" disabled={submitting || !cart.items?.length} className="mt-7 flex h-[58px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#ef3338] text-[18px] font-black text-white shadow-[0_14px_28px_rgba(239,51,56,0.22)] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-50">
                <Icon name="card" /> {submitting ? "Placing Order..." : "Place Order"} <Icon name="arrowRight" />
              </button>
              <div className="mt-5 flex h-[48px] items-center justify-center gap-3 rounded-[8px] bg-[#f8fafc] text-[14px] font-semibold text-[#4b5563]">
                <Icon name="lock" className="size-4 text-emerald-500" /> SSL encrypted checkout
              </div>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}
