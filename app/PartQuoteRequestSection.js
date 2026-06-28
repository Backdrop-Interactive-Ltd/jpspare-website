"use client";

import { useRef, useState } from "react";

function QuoteIcon({ name, className = "size-5" }) {
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

function FieldsetTitle({ icon, title, className = "" }) {
  return (
    <div className={`flex items-center gap-3 text-[14px] font-black text-[#111827] ${className}`}>
      <span className="grid size-9 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338]">
        <QuoteIcon name={icon} className="size-4" />
      </span>
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
        className="mt-2 h-12 w-full rounded-[8px] border border-[#d7dee8] bg-[#fbfcfe] px-4 text-[14px] font-medium outline-none transition placeholder:text-[#9ca3af] hover:border-[#ef3338]/45 focus:border-[#ef3338] focus:bg-white focus:ring-4 focus:ring-[#ef3338]/10"
      />
    </label>
  );
}

export default function PartQuoteRequestSection() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="w-full px-4 pb-20 pt-0 text-[#111827] sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1635px]">
        <div className="relative flex min-h-[300px] w-full items-center overflow-hidden border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] px-6 py-12 text-white sm:px-9 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
          <div className="relative flex w-full flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[820px]">
              <span className="inline-flex items-center rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
                JPSPARE Parts Assistance
              </span>
              <h1 className="mt-6 text-[42px] font-black leading-tight tracking-[-0.04em] sm:text-[56px]">
                Request a <span className="text-[#ff4a50]">Part Quote</span>
              </h1>
              <p className="mt-4 max-w-[720px] text-[16px] font-medium leading-7 text-white/68">
                Share your vehicle details and required part information. Our team will review availability, fitment, and pricing before getting back to you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-white/15 bg-white/8 p-3 backdrop-blur-sm sm:grid-cols-4 lg:ml-auto lg:min-w-[520px]">
              {[
                ["24/7", "Support"],
                ["3-5", "Day Response"],
                ["OEM", "Guidance"],
                ["BD", "Delivery"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[6px] bg-black/15 px-3 py-3 text-center">
                  <p className="text-[19px] font-black text-[#ff5b61]">{value}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <aside className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <span className="inline-flex rounded-full bg-[#fff1f2] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#ef3338]">
              Quote Checklist
            </span>
            <h2 className="mt-5 text-[28px] font-black leading-tight tracking-[-0.03em]">
              Faster quote-er jonno details clear rakhen.
            </h2>
            <p className="mt-4 text-[14px] font-medium leading-7 text-[#667085]">
              Vehicle make, model, year, and part name dile amader team exact availability and fitment check korte parbe.
            </p>
            <div className="mt-7 space-y-3">
              {[
                "Vehicle make, model, year",
                "Specific part name or category",
                "Photo/document upload if available",
                "Urgency and contact details",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[8px] border border-[#edf0f3] bg-[#f8fafc] px-4 py-3 text-[13px] font-bold text-[#344054]">
                  <span className="grid size-6 place-items-center rounded-full bg-[#ef3338] text-white">
                    <QuoteIcon name="check" className="size-3.5" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-[8px] bg-[#111827] p-5 text-white">
              <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#ff8c91]">Need urgent help?</p>
              <p className="mt-3 text-[24px] font-black">01718914582</p>
              <p className="mt-2 text-[13px] font-medium leading-6 text-white/62">Call our support team for urgent automotive breakdowns or hard-to-find parts.</p>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-[8px] border border-[#e1e7ef] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] max-sm:p-5">
            <FieldsetTitle icon="phone" title="Personal Information" />
            <div className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <Input label="Full Name *" placeholder="Enter your full name" required />
              <Input label="Email Address *" placeholder="your.email@example.com" type="email" required />
              <Input label="Phone Number" placeholder="+880 XXXX XXXXXX" />
              <Input label="Urgency Level" placeholder="Normal (3-5 days)" />
            </div>

            <FieldsetTitle icon="pin" title="Vehicle Information" className="mt-9" />
            <div className="mt-5 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
              <Input label="Car Make *" placeholder="e.g., Toyota, Honda, Nissan" required />
              <Input label="Car Model *" placeholder="e.g., Corolla, Civic, Altima" required />
              <Input label="Year *" placeholder="2020" required />
            </div>

            <FieldsetTitle icon="check" title="Part Information" className="mt-9" />
            <div className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <Input label="Part Category *" placeholder="Select a category" required />
              <Input label="Specific Part Name *" placeholder="e.g., Front brake pads, Oil filter" required />
            </div>

            <FieldsetTitle icon="mail" title="Additional Details" className="mt-9" />
            <label className="mt-5 block text-[12px] font-bold text-[#374151]">
              Message / Additional Requirements
              <textarea className="mt-2 min-h-28 w-full resize-none rounded-[8px] border border-[#d7dee8] bg-[#fbfcfe] px-4 py-3 text-[14px] font-medium outline-none transition placeholder:text-[#9ca3af] hover:border-[#ef3338]/45 focus:border-[#ef3338] focus:bg-white focus:ring-4 focus:ring-[#ef3338]/10" placeholder="Please provide any additional details about the part you need, installation requirements, or specific questions." />
            </label>

            <div className="mt-6">
              <p className="text-[12px] font-bold text-[#374151]">Attach Images or Documents (Optional)</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 flex min-h-28 w-full flex-col items-center justify-center rounded-[8px] border border-dashed border-[#ef3338] bg-[#fff5f5] px-4 py-5 text-center text-[12px] font-medium text-[#6b7280] transition hover:bg-[#fff1f2]">
                <QuoteIcon name="upload" className="mb-2 size-6 text-[#ef3338]" />
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

            <div className="mt-7">
              <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#ef3338] px-10 text-[14px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f24]">
                <QuoteIcon name="mail" className="size-4" />
                Submit Inquiry
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
