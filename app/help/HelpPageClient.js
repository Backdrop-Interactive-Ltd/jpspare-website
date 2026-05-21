"use client";

import Link from "next/link";
import { useRef, useState } from "react";

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
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="bg-white text-[#111827]">
      <section className="relative isolate overflow-hidden bg-[#111827] py-24 text-white max-md:py-18">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url('/product-detail-reference.jpg')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(17,24,39,0.86),rgba(17,24,39,0.56)),radial-gradient(circle_at_70%_30%,rgba(239,68,68,0.34),transparent_36%)]" />
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center px-4 text-center sm:px-6 lg:px-8 xl:px-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ef4444]/35 bg-[#ef4444]/15 px-4 py-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#ffd3d3]">
            <HelpIcon name="phone" className="size-3.5" />
            24/7 Customer Support Available
          </span>
          <h1 className="mt-5 text-[48px] font-black leading-none tracking-[-0.02em] max-md:text-[38px] max-sm:text-[32px]">
            Get In <span className="text-[#ef4444]">Touch</span>
          </h1>
          <p className="mt-5 max-w-[650px] text-[17px] font-medium leading-8 text-white/78 max-sm:text-[15px] max-sm:leading-7">
            Need help finding the perfect part? Our automotive experts are here to assist you with genuine Japanese auto parts and professional guidance.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-[13px] font-bold text-white/78">
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
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center">
          <h2 className="text-[30px] font-black tracking-[-0.02em] max-sm:text-[26px]">
            Multiple Ways to <span className="text-[#ef4444]">Reach Us</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[620px] text-[15px] font-medium leading-7 text-[#6b7280]">
            Choose the most convenient way to get in touch with our automotive parts experts. We are committed to providing exceptional service and support.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[980px] grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {contactCards.map((card) => (
            <article key={card.title} className="rounded-[10px] border border-[#e5e7eb] bg-white p-6 shadow-[0_14px_32px_rgba(15,23,42,0.08)] transition hover:border-[#ef4444] hover:shadow-[0_18px_42px_rgba(239,68,68,0.14)]">
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

        <div className="mx-auto mt-12 grid max-w-[980px] grid-cols-2 gap-8 max-lg:grid-cols-1">
          <article className="rounded-[10px] border border-[#e5e7eb] bg-white p-8 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-[8px] bg-[#ef4444] text-white">
                <HelpIcon name="clock" className="size-5" />
              </span>
              <h3 className="text-[20px] font-black">Business Hours</h3>
            </div>
            <dl className="mt-8 space-y-6 text-[14px] font-medium text-[#4b5563]">
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
            <div className="mt-8 rounded-[8px] border border-[#fee2e2] bg-[#fff7ed] p-4 text-[12px] font-medium leading-6 text-[#6b7280]">
              <strong className="text-[#111827]">Note:</strong> Emergency parts support available 24/7 for urgent automotive needs. Contact us anytime for critical breakdowns.
            </div>
          </article>

          <article className="rounded-[10px] bg-[#111827] p-8 text-white shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
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

      <section className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center">
          <h2 className="text-[30px] font-black tracking-[-0.02em] max-sm:text-[26px]">
            Request a <span className="text-[#ef4444]">Part Quote</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[650px] text-[15px] font-medium leading-7 text-[#6b7280]">
            Fill out this form with your vehicle details and part requirements. Our experts will get back to you with availability and pricing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-[680px] rounded-[12px] border border-[#e5e7eb] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] max-sm:p-5">
          <FieldsetTitle icon="phone" title="Personal Information" />
          <div className="mt-4 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <Input label="Full Name *" placeholder="Enter your full name" required />
            <Input label="Email Address *" placeholder="your.email@example.com" type="email" required />
            <Input label="Phone Number" placeholder="+880 XXXX XXXXXX" />
            <Input label="Urgency Level" placeholder="Normal (3-5 days)" />
          </div>

          <FieldsetTitle icon="pin" title="Vehicle Information" className="mt-8" />
          <div className="mt-4 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <Input label="Car Make *" placeholder="e.g., Toyota, Honda, Nissan" required />
            <Input label="Car Model *" placeholder="e.g., Corolla, Civic, Altima" required />
            <Input label="Year *" placeholder="2020" required />
          </div>

          <FieldsetTitle icon="check" title="Part Information" className="mt-8" />
          <div className="mt-4 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <Input label="Part Category *" placeholder="Select a category" required />
            <Input label="Specific Part Name *" placeholder="e.g., Front brake pads, Oil filter" required />
          </div>

          <FieldsetTitle icon="mail" title="Additional Details" className="mt-8" />
          <label className="mt-4 block text-[12px] font-bold text-[#374151]">
            Message / Additional Requirements
            <textarea className="mt-2 min-h-28 w-full resize-none rounded-[7px] border border-[#d1d5db] px-4 py-3 text-[14px] font-medium outline-none transition placeholder:text-[#9ca3af] focus:border-[#ef4444] focus:ring-4 focus:ring-[#ef4444]/10" placeholder="Please provide any additional details about the part you need, installation requirements, or specific questions." />
          </label>

          <div className="mt-6">
            <p className="text-[12px] font-bold text-[#374151]">Attach Images or Documents (Optional)</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 flex min-h-28 w-full flex-col items-center justify-center rounded-[8px] border border-dashed border-[#d1d5db] bg-[#fafafa] px-4 py-5 text-center text-[12px] font-medium text-[#6b7280] transition hover:border-[#ef4444] hover:bg-[#fff5f5]">
              <HelpIcon name="upload" className="mb-2 size-6 text-[#9ca3af]" />
              <span className="font-bold text-[#4b5563]">{fileName || "Click to upload images of the part or relevant documents"}</span>
              <span className="mt-1 text-[#9ca3af]">Supported: JPG, PNG, PDF, DOC. Max 10MB each</span>
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} />
          </div>

          {submitted && (
            <div className="mt-5 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700">
              Demo inquiry received. Our support team will contact you shortly.
            </div>
          )}

          <div className="mt-7 text-center">
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#ef4444] px-10 text-[14px] font-black text-white shadow-[0_16px_30px_rgba(239,68,68,0.22)] transition hover:bg-[#dc2626]">
              <HelpIcon name="mail" className="size-4" />
              Submit Inquiry
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center">
          <h2 className="text-[30px] font-black tracking-[-0.02em] max-sm:text-[26px]">
            Visit Our <span className="text-[#ef4444]">Locations</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[650px] text-[15px] font-medium leading-7 text-[#6b7280]">
            Find us at our convenient locations across Dhaka. Visit our showroom to see our parts collection or contact us for directions.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[980px] grid-cols-2 gap-8 max-lg:grid-cols-1">
          <article className="overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <div className="relative flex min-h-[300px] items-center justify-center bg-[#dbeafe] text-center">
              <div className="absolute inset-0 bg-[linear-gradient(#bfdbfe_1px,transparent_1px),linear-gradient(90deg,#bfdbfe_1px,transparent_1px)] bg-[size:38px_38px] opacity-70" />
              <div className="relative z-10">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-lg">
                  <HelpIcon name="pin" />
                </span>
                <h3 className="mt-4 text-[15px] font-black text-[#1e40af]">Interactive Map</h3>
                <p className="mt-1 text-[13px] font-bold text-[#3b82f6]">JPSPARE Location</p>
                <p className="text-[12px] font-medium text-[#6b7280]">Dhaka, Bangladesh</p>
              </div>
              <a href="https://maps.google.com/?q=Dhaka" target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 rounded-[6px] bg-white px-3 py-2 text-[11px] font-bold text-[#6b7280] shadow">
                Get Directions
              </a>
            </div>
            <div className="flex items-center justify-between gap-4 bg-[#111827] p-6 text-white max-sm:flex-col max-sm:items-start">
              <div>
                <h3 className="text-[24px] font-black">Need Directions?</h3>
                <p className="mt-1 text-[13px] font-medium text-white/70">Call us for detailed location guidance</p>
              </div>
              <a href="https://maps.google.com/?q=Dhaka" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-[7px] bg-[#ef4444] px-5 text-[12px] font-black text-white">
                Get Directions
              </a>
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-[10px] border border-[#facc15]/50 bg-[#fff7ed] p-7 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
              <span className="inline-flex rounded-full bg-[#ef4444] px-3 py-1 text-[11px] font-black text-white">Flagship Store</span>
              <h3 className="mt-5 flex items-center gap-2 text-[18px] font-black">
                <HelpIcon name="pin" className="size-5 text-[#ef4444]" />
                JPSPARE Flagship Store
              </h3>
              <div className="mt-5 space-y-4 text-[13px] font-medium text-[#4b5563]">
                <p>277 Tejgaon Industrial Area, Dhaka</p>
                <p>01718914582</p>
                <p>Sat-Thu: 10PM-8PM, Fri: 10PM-8PM</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <a href="tel:01718914582" className="inline-flex h-11 items-center justify-center rounded-[7px] bg-[#ef4444] text-[13px] font-black text-white">Call Now</a>
                <a href="https://maps.google.com/?q=Dhaka" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#e5e7eb] bg-white text-[13px] font-black text-[#374151]">Directions</a>
              </div>
            </article>

            <article className="rounded-[10px] bg-[#111827] p-7 text-white shadow-[0_14px_32px_rgba(15,23,42,0.12)]">
              <h3 className="flex items-center gap-3 text-[18px] font-black">
                <span className="inline-flex size-10 items-center justify-center rounded-[8px] bg-[#ef4444]">
                  <HelpIcon name="headphones" />
                </span>
                Emergency Support
              </h3>
              <p className="mt-4 text-[13px] font-medium leading-6 text-white/70">
                Need immediate assistance? Our 24/7 emergency support is available for critical automotive breakdowns and urgent part requirements.
              </p>
              <div className="mt-6 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                <div>
                  <p className="text-[13px] font-bold">01718914582</p>
                  <p className="mt-1 text-[12px] font-medium text-white/50">Available 24/7</p>
                </div>
                <a href="tel:01718914582" className="inline-flex h-10 items-center rounded-[7px] bg-[#ef4444] px-5 text-[12px] font-black text-white">Emergency Call</a>
              </div>
            </article>
          </div>
        </div>
      </section>

    </main>
  );
}

function FieldsetTitle({ icon, title, className = "" }) {
  return (
    <div className={`flex items-center gap-2 text-[13px] font-black text-[#111827] ${className}`}>
      <HelpIcon name={icon} className="size-4 text-[#ef4444]" />
      {title}
    </div>
  );
}

function Input({ label, type = "text", placeholder, required = false }) {
  return (
    <label className="block text-[12px] font-bold text-[#374151]">
      {label}
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-[7px] border border-[#d1d5db] px-4 text-[14px] font-medium outline-none transition placeholder:text-[#9ca3af] focus:border-[#ef4444] focus:ring-4 focus:ring-[#ef4444]/10"
      />
    </label>
  );
}
