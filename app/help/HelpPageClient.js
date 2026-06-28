"use client";

import Link from "next/link";

const contactCards = [
  {
    title: "Phone Support",
    detail: "01718914582",
    sub: "+8801905400772",
    note: "Call us for immediate assistance",
    icon: "phone",
    tone: "green",
  },
  {
    title: "Email Support",
    detail: "info@jpspare.com.bd",
    sub: "support@jpspare.com.bd",
    note: "Send us your detailed inquiries",
    icon: "mail",
    tone: "blue",
  },
  {
    title: "Visit Our Store",
    detail: "277 Tejgaon Industrial Area, Dhaka",
    sub: "Multiple locations available",
    note: "Come see our parts collection",
    icon: "pin",
    tone: "purple",
  },
  {
    title: "Live Chat",
    detail: "Available Now",
    sub: "24/7 Online Support",
    note: "Get instant help online",
    icon: "headphones",
    tone: "orange",
  },
];

const whyItems = [
  ["Genuine Japanese Parts", "Authentic OEM and aftermarket parts from trusted Japanese manufacturers"],
  ["Expert Technical Support", "Our team has years of experience with Japanese automotive systems"],
  ["Fast Nationwide Delivery", "Quick shipping across Bangladesh with secure packaging"],
  ["Quality Guarantee", "All parts come with warranty and quality assurance"],
];

function HelpIcon({ name, className = "size-5" }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

  if (name === "phone") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M12 22s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "headphones") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M3 18v-5a9 9 0 0 1 18 0v5" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5Z" />
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "upload") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M20 16v4H4v-4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" {...common}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function toneClasses(tone) {
  const tones = {
    green: "bg-emerald-500 text-white",
    blue: "bg-blue-500 text-white",
    purple: "bg-fuchsia-500 text-white",
    orange: "bg-orange-500 text-white",
  };

  return tones[tone] || tones.orange;
}

export default function HelpPageClient() {
  return (
    <main className="bg-[#f4f6f8] text-[#111827]">
      <section className="w-full px-4 pb-8 pt-0 sm:px-6 lg:px-10">
        <div className="relative mx-auto min-h-[330px] w-full max-w-[1635px] overflow-hidden border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_60%,#4b1d2b_100%)] px-6 py-14 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)] sm:px-9 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
          <div className="relative flex min-h-[220px] w-full flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
            <HelpIcon name="phone" className="size-3.5" />
            24/7 Customer Support Available
          </span>
          <h1 className="mt-6 text-[52px] font-black leading-tight tracking-[-0.04em] max-md:text-[40px] max-sm:text-[32px]">
            Get In <span className="text-[#ef4444]">Touch</span>
          </h1>
          <p className="mt-4 max-w-[720px] text-[17px] font-medium leading-8 text-white/72 max-sm:text-[15px] max-sm:leading-7">
            Need help finding the perfect part? Our automotive experts are here to assist you with genuine Japanese auto parts and professional guidance.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5 text-[13px] font-bold text-white/78">
            <a href="tel:01718914582" className="inline-flex items-center gap-2 hover:text-white">
              <HelpIcon name="phone" className="size-4 text-[#ef4444]" />
              01718914582
            </a>
            <a href="mailto:info@jpspare.com.bd" className="inline-flex items-center gap-2 hover:text-white">
              <HelpIcon name="mail" className="size-4 text-[#ef4444]" />
              info@jpspare.com.bd
            </a>
            <span className="inline-flex items-center gap-2">
              <HelpIcon name="clock" className="size-4 text-[#ef4444]" />
              Sat-Thu 10PM-8PM, Fri 10PM-8PM
            </span>
          </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1635px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="text-center">
          <h2 className="text-[30px] font-black tracking-[-0.02em] max-sm:text-[26px]">
            Multiple Ways to <span className="text-[#ef4444]">Reach Us</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[620px] text-[15px] font-medium leading-7 text-[#6b7280]">
            Choose the most convenient way to get in touch with our automotive parts experts. We are committed to providing exceptional service and support.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {contactCards.map((card) => (
            <article key={card.title} className="rounded-[8px] border border-[#e5eaf1] bg-white p-7 shadow-[0_14px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#f2c7c9] hover:shadow-[0_22px_46px_rgba(239,51,56,0.12)]">
              <span className={`inline-flex size-10 items-center justify-center rounded-[8px] ${toneClasses(card.tone)}`}>
                <HelpIcon name={card.icon} className="size-5" />
              </span>
              <h3 className="mt-5 text-[15px] font-black">{card.title}</h3>
              <p className="mt-3 text-[12px] font-bold text-[#111827]">{card.detail}</p>
              <p className="mt-1 text-[12px] font-medium text-[#6b7280]">{card.sub}</p>
              <p className="mt-3 text-[11px] font-medium text-[#9ca3af]">{card.note}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          <div className="flex h-full flex-col gap-4">
            <article className="rounded-[8px] border border-[#e5eaf1] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-[8px] bg-[#ef4444] text-white">
                  <HelpIcon name="clock" className="size-5" />
                </span>
                <h3 className="text-[20px] font-black">Business Hours</h3>
              </div>
              <dl className="mt-5 space-y-3 text-[14px] font-medium text-[#4b5563]">
                <div className="flex items-center justify-between gap-4">
                  <dt>Saturday - Thursday</dt>
                  <dd className="text-[#111827]">10:00 AM - 8:00 PM</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Friday</dt>
                  <dd className="text-[#111827]">10:00 AM - 8:00 PM</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Emergency Support</dt>
                  <dd className="text-[#111827]">24/7 Available</dd>
                </div>
              </dl>
              <div className="mt-5 rounded-[8px] border border-[#fee2e2] bg-[#fff7ed] px-4 py-3 text-[12px] font-medium leading-5 text-[#6b7280]">
                <strong className="text-[#111827]">Note:</strong> Emergency parts support available 24/7 for urgent automotive needs. Contact us anytime for critical breakdowns.
              </div>
            </article>

            <article className="flex flex-1 flex-col rounded-[8px] border border-[#fed7aa] bg-[#fff7ed] p-6 text-[#111827] shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
              <h3 className="flex items-center gap-3 text-[20px] font-black leading-none tracking-[-0.02em]">
                <span className="inline-flex size-10 items-center justify-center rounded-[8px] bg-[#ef4444]">
                  <HelpIcon name="headphones" />
                </span>
                Emergency Support
              </h3>
              <p className="mt-5 max-w-[620px] text-[16px] font-medium leading-[1.55] text-[#374151]">
                Need immediate assistance? Our 24/7 emergency support is available for critical automotive breakdowns and urgent part requirements.
              </p>
              <div className="mt-auto flex items-center justify-between gap-4 pt-4 max-sm:flex-col max-sm:items-start">
                <div>
                  <p className="text-[18px] font-black tracking-[-0.02em] text-[#374151]">01718914582</p>
                  <p className="mt-3 text-[14px] font-medium text-[#6b7280]">Available 24/7</p>
                </div>
                <a href="tel:01718914582" className="inline-flex h-10 items-center rounded-[7px] bg-[#ef4444] px-5 text-[14px] font-bold text-white">Emergency Call</a>
              </div>
            </article>
          </div>

          <article className="rounded-[8px] bg-[#111827] p-8 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-[8px] bg-[#ef4444] text-white">
                <HelpIcon name="pin" className="size-5" />
              </span>
              <h3 className="text-[20px] font-black">Why Choose Us?</h3>
            </div>
            <div className="mt-8 space-y-6">
              {whyItems.map(([title, body]) => (
                <div key={title} className="relative pl-5">
                  <span className="absolute left-0 top-2 size-1.5 rounded-full bg-[#ef4444]" />
                  <h4 className="text-[20px] font-black leading-tight">{title}</h4>
                  <p className="mt-1 text-[12px] font-medium leading-5 text-white/60">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[7px] border border-white/15 bg-white/10 p-5 text-[12px] font-medium text-white/55">
              Need expert advice? Our support team will help you choose the right part before you order.
            </div>
          </article>
        </div>
      </section>

    </main>
  );
}
