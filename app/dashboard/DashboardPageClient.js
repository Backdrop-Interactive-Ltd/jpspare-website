"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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

const stats = [
  { icon: "box", value: "0", label: "Total Orders", helper: "", tone: "blue" },
  { icon: "clock", value: "0", label: "Active Orders", helper: "Currently processing", tone: "green" },
  { icon: "trend", value: "$0.00", label: "Total Spent", helper: "Lifetime investment", tone: "red" },
];

const actions = [
  {
    icon: "box",
    title: "My Orders",
    text: "Track orders, view history, and manage returns",
    cta: "View Orders",
    href: "#orders",
    tone: "blue",
  },
  {
    icon: "clock",
    title: "Track Order",
    text: "Real-time tracking for your shipments",
    cta: "Track Now",
    href: "#track",
    tone: "red",
  },
  {
    icon: "pin",
    title: "Addresses",
    text: "Manage shipping and billing addresses",
    cta: "Manage Addresses",
    href: "#addresses",
    tone: "green",
    featured: true,
  },
  {
    icon: "settings",
    title: "Account Settings",
    text: "Update profile and security settings",
    cta: "Manage Settings",
    href: "#settings",
    tone: "gray",
  },
];

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

  const handleLogout = () => {
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
            <span className="block text-[#df171d]">Fazlur</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[820px] text-[22px] leading-8 text-[#4b5563] max-sm:text-[17px]">
            Manage your orders, track shipments, and access premium Japanese auto parts
          </p>
        </div>

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
