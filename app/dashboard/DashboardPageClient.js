"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function Icon({ name, className = "size-6" }) {
  const icons = {
    user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3 0-1 6 4-2 4 2-1-6",
    box: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.5 8.5 12 13l8.5-4.5M12 22v-9",
    clock: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    trend: "m4 17 6-6 4 4 6-8M15 7h5v5",
    pin: "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    settings: "M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm8-3.5a8 8 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L15.5 3h-4l-.4 3a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a8 8 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 3h4l.4-3a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z",
    arrow: "M5 12h14m-7-7 7 7-7 7",
    logout: "M10 17l5-5-5-5M15 12H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

const actions = [
  {
    icon: "box",
    title: "My Orders",
    text: "Track orders, view history, and manage returns",
    cta: "View Orders",
    href: "/account/orders",
    tone: "blue",
  },
  {
    icon: "clock",
    title: "Track Order",
    text: "Real-time tracking for your shipments",
    cta: "Track Now",
    href: "/track-order",
    tone: "red",
  },
  {
    icon: "pin",
    title: "Addresses",
    text: "Manage shipping and billing addresses",
    cta: "Manage Addresses",
    href: "/account",
    tone: "green",
    featured: true,
  },
  {
    icon: "settings",
    title: "Account Settings",
    text: "Update profile and security settings",
    cta: "Manage Settings",
    href: "/account",
    tone: "gray",
  },
];

const profileFieldLabels = {
  name: "Full name",
  phone: "Phone number",
  addressLine1: "Delivery address",
  city: "City",
  zone: "Zone/Area",
};

const emptyCompletionForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "Dhaka",
  zone: "",
  postalCode: "",
  country: "Bangladesh",
};

function toneClasses(tone) {
  const tones = {
    blue: "bg-[#eff4ff] text-[#2563eb]",
    green: "bg-[#e9fbf3] text-[#059669]",
    red: "bg-[#fff0f0] text-[#df171d]",
    gray: "bg-[#f3f4f6] text-[#4b5563]",
  };

  return tones[tone] || tones.gray;
}

function StatCard({ item }) {
  return (
    <article className="rounded-[10px] border border-[#dfe5ec] bg-white p-8 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(239,51,56,0.10)]">
      <div className={`grid size-16 place-items-center rounded-[10px] ${toneClasses(item.tone)}`}>
        <Icon name={item.icon} />
      </div>
      <p className="mt-8 text-[42px] font-black leading-none text-[#111827]">{item.value}</p>
      <h2 className="mt-5 text-[18px] font-medium text-[#4b5563]">{item.label}</h2>
      {item.helper && <p className="mt-3 text-[15px] text-[#8a94a6]">{item.helper}</p>}
    </article>
  );
}

function buildCompletionForm(customer) {
  const address = customer?.addresses?.find((item) => item.isDefault) || customer?.addresses?.[0];

  return {
    firstName: customer?.firstName || "",
    lastName: customer?.lastName || "",
    phone: customer?.phone || address?.phone || "",
    email: customer?.email || "",
    addressLine1: address?.addressLine1 || "",
    addressLine2: address?.addressLine2 || "",
    city: address?.city || "Dhaka",
    zone: address?.zone || "",
    postalCode: address?.postalCode || "",
    country: address?.country || "Bangladesh",
  };
}

function CompletionField({ label, name, value, onChange, required = false, placeholder = "", type = "text", error = "", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[12px] font-black uppercase tracking-[0.11em] text-[#374151]">
        {label} {required ? <span className="text-[#ef3338]">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-2 h-12 w-full rounded-[9px] border bg-white px-4 text-[15px] font-medium text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10 ${error ? "border-[#ef3338]" : "border-[#d7dde6]"}`}
      />
      {error ? <span className="mt-2 block text-[12px] font-bold text-[#c8191f]">{error}</span> : null}
    </label>
  );
}

function ActionCard({ item }) {
  return (
    <Link href={item.href} className={`block rounded-[10px] border bg-white p-8 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(239,51,56,0.10)] ${item.featured ? "border-[#f7d95f]" : "border-[#dfe5ec]"}`}>
      <div className={`grid size-16 place-items-center rounded-[10px] ${toneClasses(item.tone)}`}>
        <Icon name={item.icon} />
      </div>
      <h3 className="mt-8 text-[22px] font-black text-[#111827]">{item.title}</h3>
      <p className="mt-5 min-h-[84px] text-[18px] leading-8 text-[#4b5563]">{item.text}</p>
      <span className={`mt-4 inline-flex items-center gap-2 text-[17px] font-medium ${item.tone === "blue" ? "text-[#2563eb]" : item.tone === "green" ? "text-[#16a34a]" : item.tone === "red" ? "text-[#df171d]" : "text-[#374151]"}`}>
        {item.cta}
        <Icon name="arrow" className="size-4" />
      </span>
    </Link>
  );
}

export default function DashboardPageClient() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [completionForm, setCompletionForm] = useState(emptyCompletionForm);
  const [completionErrors, setCompletionErrors] = useState({});
  const [completionMessage, setCompletionMessage] = useState("");
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAccount() {
      try {
        setError("");
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) {
          localStorage.removeItem("jpspare-auth");
          window.dispatchEvent(new Event("jpspare-auth-change"));
          router.push("/signin");
          return;
        }
        const data = await response.json();
        const ordersResponse = await fetch("/api/orders", {
          cache: "no-store",
          credentials: "include",
        });
        if (ordersResponse.status === 401) {
          localStorage.removeItem("jpspare-auth");
          window.dispatchEvent(new Event("jpspare-auth-change"));
          router.push("/signin");
          return;
        }
        const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] };
        if (active) {
          setCustomer(data.customer);
          setProfileComplete(Boolean(data.profileComplete));
          setProfileCompletion(data.profileCompletion || null);
          setCompletionForm(buildCompletionForm(data.customer));
          setOrders(ordersData.orders || []);
        }
      } catch {
        if (active) {
          setError("Unable to load account data right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadAccount();
    return () => {
      active = false;
    };
  }, [router]);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const activeOrders = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length;
    return [
      { icon: "box", value: String(orders.length), label: "Total Orders", helper: "", tone: "blue" },
      { icon: "clock", value: String(activeOrders), label: "Active Orders", helper: "Currently processing", tone: "green" },
      { icon: "trend", value: `৳${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: "Total Spent", helper: "Lifetime investment", tone: "red" },
    ];
  }, [orders]);

  const customerFullName = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  const customerDisplayName = customerFullName || customer?.email || "JPSPARE Member";

  function handleCompletionChange(event) {
    const { name, value } = event.target;
    setCompletionForm((current) => ({ ...current, [name]: value }));
  }

  function validateCompletionForm() {
    const errors = {};

    if (!completionForm.firstName.trim() && !completionForm.lastName.trim()) {
      errors.firstName = "First or last name is required.";
    }

    if (!completionForm.phone.trim()) {
      errors.phone = "Phone number is required.";
    }

    if (!completionForm.addressLine1.trim()) {
      errors.addressLine1 = "Delivery address is required.";
    }

    if (!completionForm.city.trim()) {
      errors.city = "City is required.";
    }

    if (!completionForm.zone.trim()) {
      errors.zone = "Zone or area is required.";
    }

    return errors;
  }

  async function refreshProfileState() {
    const response = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    setCustomer(data.customer);
    setProfileComplete(Boolean(data.profileComplete));
    setProfileCompletion(data.profileCompletion || null);
    setCompletionForm(buildCompletionForm(data.customer));
    return data;
  }

  async function handleCompletionSubmit(event) {
    event.preventDefault();
    setCompletionMessage("");
    const errors = validateCompletionForm();
    setCompletionErrors(errors);

    if (Object.keys(errors).length) {
      setCompletionMessage("Please fill the required profile and delivery fields.");
      return;
    }

    setSavingCompletion(true);

    try {
      const profileResponse = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: completionForm.firstName,
          lastName: completionForm.lastName,
          phone: completionForm.phone,
          email: completionForm.email,
        }),
      });
      const profileData = await profileResponse.json().catch(() => ({}));

      if (!profileResponse.ok) {
        setCompletionMessage(profileData.message || "We could not update your profile right now.");
        return;
      }

      const defaultAddress = customer?.addresses?.find((item) => item.isDefault) || customer?.addresses?.[0];
      const addressPayload = {
        type: "SHIPPING",
        firstName: completionForm.firstName,
        lastName: completionForm.lastName,
        phone: completionForm.phone,
        addressLine1: completionForm.addressLine1,
        addressLine2: completionForm.addressLine2,
        city: completionForm.city,
        zone: completionForm.zone,
        postalCode: completionForm.postalCode,
        country: completionForm.country || "Bangladesh",
        isDefault: true,
      };
      const addressResponse = await fetch(defaultAddress ? `/api/account/addresses/${defaultAddress.id}` : "/api/account/addresses", {
        method: defaultAddress ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addressPayload),
      });
      const addressData = await addressResponse.json().catch(() => ({}));

      if (!addressResponse.ok) {
        setCompletionMessage(addressData.error || "We could not save your delivery address right now.");
        return;
      }

      const refreshed = await refreshProfileState();
      setCompletionErrors({});
      setCompletionMessage(refreshed?.profileComplete ? "Profile completed. You can now place orders." : "Information saved. Please review the remaining required fields.");
    } catch {
      setCompletionMessage("Unable to save profile information right now.");
    } finally {
      setSavingCompletion(false);
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("jpspare-auth");
    window.dispatchEvent(new Event("jpspare-auth-change"));
    router.push("/signin");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111827]">
      <section className="relative mx-auto w-full max-w-[1500px] px-4 py-20 sm:px-6 lg:px-8 xl:px-10">
        <div className="pointer-events-none absolute left-[-140px] top-[190px] size-[430px] rounded-full bg-[#f7d95f]/10 blur-[82px]" />
        <div className="pointer-events-none absolute right-[-90px] bottom-[70px] size-[470px] rounded-full bg-[#ef3338]/8 blur-[105px]" />

        <nav className="relative z-10 mb-14 flex items-center justify-center gap-3 text-[15px]">
          <Link href="/" className="text-[#111827] transition hover:text-[#ef3338]">Home</Link>
          <span className="text-[#98a2b3]">/</span>
          <span className="text-[#111827]">Dashboard</span>
        </nav>

        <button type="button" onClick={handleLogout} className="absolute right-4 top-10 z-20 inline-flex items-center gap-2 rounded-full border border-[#fecaca] bg-[#fff1f1] px-5 py-2.5 text-[13px] font-black uppercase tracking-[0.04em] text-[#df171d] transition hover:bg-[#df171d] hover:text-white sm:right-6 lg:right-8 xl:right-10">
          <Icon name="logout" className="size-4" />
          Logout
        </button>

        <div className="relative z-10 text-center">
          <div className="mb-8 flex items-center justify-center">
            <span className="mr-[-20px] inline-flex h-12 items-center gap-2 rounded-full border border-[#fde68a] bg-[#fff7ed] px-8 text-[14px] font-black uppercase tracking-[0.04em] text-[#8a4a00] shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              <Icon name="award" className="size-4 text-[#df171d]" />
              Member Dashboard
            </span>
            <span className="relative grid size-32 place-items-center rounded-full bg-[#ef3338] text-white shadow-[0_18px_38px_rgba(239,51,56,0.25)]">
              <Icon name="user" className="size-16" />
              <span className="absolute bottom-4 right-0 grid size-9 place-items-center rounded-full border-[6px] border-white bg-[#10b981]" />
            </span>
          </div>

          <h1 className="text-[58px] font-black leading-tight tracking-[-0.04em] text-[#111827] max-sm:text-[38px]">
            Welcome Back,
            <span className="block text-[#df171d]">{loading ? "..." : customerDisplayName}</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[820px] text-[22px] leading-8 text-[#4b5563] max-sm:text-[17px]">
            Manage your orders, track shipments, and access premium Japanese auto parts
          </p>
          {error ? <p className="mx-auto mt-4 max-w-[820px] text-[15px] font-bold text-[#df171d]">{error}</p> : null}
        </div>

        {!loading ? (
          <section className="relative z-10 mx-auto mt-16 max-w-[1220px] rounded-[14px] border border-[#dfe5ec] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-5 max-lg:flex-col">
              <div>
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-[0.11em] ${profileComplete ? "bg-[#e9fbf3] text-[#047857]" : "bg-[#fff1f1] text-[#c8191f]"}`}>
                  <Icon name={profileComplete ? "award" : "settings"} className="size-4" />
                  {profileComplete ? "Profile Complete" : "Profile Required"}
                </span>
                <h2 className="mt-5 text-[30px] font-black tracking-[-0.03em] text-[#111827]">
                  {profileComplete ? "Your Profile Is Ready" : "Complete Your Profile"}
                </h2>
                <p className="mt-3 max-w-[640px] text-[17px] leading-7 text-[#5f6878]">
                  Add your contact and delivery information to place orders smoothly.
                </p>
              </div>
              {!profileComplete && profileCompletion?.missingFields?.length ? (
                <div className="flex max-w-[420px] flex-wrap gap-2">
                  {profileCompletion.missingFields.map((field) => (
                    <span key={field} className="rounded-full bg-[#fff1f1] px-3 py-1.5 text-[12px] font-black text-[#c8191f]">
                      {profileFieldLabels[field] || field}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {!profileComplete ? (
              <form onSubmit={handleCompletionSubmit} className="mt-7 grid gap-5 lg:grid-cols-2">
                <CompletionField label="First Name" name="firstName" value={completionForm.firstName} onChange={handleCompletionChange} placeholder="Fazlur" error={completionErrors.firstName} />
                <CompletionField label="Last Name" name="lastName" value={completionForm.lastName} onChange={handleCompletionChange} placeholder="Rahman" />
                <CompletionField label="Phone" name="phone" value={completionForm.phone} onChange={handleCompletionChange} required placeholder="017XXXXXXXX" error={completionErrors.phone} />
                <CompletionField label="Email" name="email" value={completionForm.email} onChange={handleCompletionChange} type="email" placeholder="you@example.com" />
                <CompletionField label="Address Line 1" name="addressLine1" value={completionForm.addressLine1} onChange={handleCompletionChange} required placeholder="House, road, area" error={completionErrors.addressLine1} className="lg:col-span-2" />
                <CompletionField label="Address Line 2" name="addressLine2" value={completionForm.addressLine2} onChange={handleCompletionChange} placeholder="Apartment, floor, landmark" className="lg:col-span-2" />
                <CompletionField label="City" name="city" value={completionForm.city} onChange={handleCompletionChange} required error={completionErrors.city} />
                <CompletionField label="Zone/Area" name="zone" value={completionForm.zone} onChange={handleCompletionChange} required placeholder="Tejgaon" error={completionErrors.zone} />
                <CompletionField label="Postal Code" name="postalCode" value={completionForm.postalCode} onChange={handleCompletionChange} placeholder="1208" />
                <CompletionField label="Country" name="country" value={completionForm.country} onChange={handleCompletionChange} placeholder="Bangladesh" />
                <div className="flex items-center gap-4 lg:col-span-2 max-sm:flex-col max-sm:items-stretch">
                  <button type="submit" disabled={savingCompletion} className="inline-flex h-12 items-center justify-center rounded-[9px] bg-[#ef3338] px-7 text-[15px] font-black text-white shadow-[0_12px_26px_rgba(239,51,56,0.20)] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60">
                    {savingCompletion ? "Saving..." : "Save Information"}
                  </button>
                  {completionMessage ? <p className={`text-[14px] font-bold ${completionMessage.includes("completed") ? "text-[#047857]" : "text-[#c8191f]"}`}>{completionMessage}</p> : null}
                </div>
              </form>
            ) : (
              <p className="mt-7 rounded-[10px] bg-[#e9fbf3] px-5 py-4 text-[15px] font-bold text-[#047857]">
                Your required contact and delivery information is saved.
              </p>
            )}
          </section>
        ) : null}

        <div className="relative z-10 mx-auto mt-24 grid max-w-[1220px] gap-8 md:grid-cols-3">
          {stats.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </div>

        <div className="relative z-10 mt-20 text-center">
          <h2 className="text-[36px] font-black tracking-[-0.03em] text-[#111827]">
            Manage Your <span className="text-[#df171d]">Account</span>
          </h2>
        </div>

        <div className="relative z-10 mx-auto mt-12 grid max-w-[1050px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((item) => (
            <ActionCard key={item.title} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
