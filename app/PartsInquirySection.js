"use client";

import Link from "next/link";
import { useState } from "react";

function InquiryIcon({ name, className = "" }) {
  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" className={className || "size-4"} fill="none" stroke="currentColor" strokeWidth="3">
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "image") {
    return (
      <svg viewBox="0 0 80 80" className={className || "size-16"} fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M21 22h38v38H21z" />
        <path d="m27 53 11-12 8 8 7-7 6 7" />
        <path d="M30 19v16a6 6 0 0 0 12 0V18a4 4 0 0 0-8 0v16" />
      </svg>
    );
  }

  return null;
}

const steps = [
  {
    title: "Inquire about parts",
    text: "Add products with descriptions, images, and notes using the form, then proceed to checkout.",
  },
  {
    title: "Get price quote",
    text: "We'll process your request, send email updates, and contact if necessary.",
  },
  {
    title: "Receive your order",
    text: "Once your order is finalized, we will ship it to you when it's ready.",
  },
];

export default function PartsInquirySection({ mode = "embedded", onClose } = {}) {
  if (mode === "page") {
    return <PartsQuoteWindow />;
  }

  if (mode === "modal") {
    return (
      <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-[7px]">
        <PartsQuoteWindow mode="modal" onClose={onClose} />
      </div>
    );
  }

  return <EmbeddedPartsInquirySection />;
}

function EmbeddedPartsInquirySection() {
  return <PartsQuoteWindow mode="embedded" />;
}

function PartsQuoteWindow({ mode = "page", onClose } = {}) {
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const isModal = mode === "modal";
  const isEmbedded = mode === "embedded";

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("Quote request captured. JPSPARE team will contact you soon.");
  }

  return (
    <section
      id={isEmbedded ? "parts-inquiry" : undefined}
      className={
        isModal
          ? "w-full max-w-[920px] text-[#111827]"
          : isEmbedded
            ? "relative overflow-hidden bg-transparent px-4 py-10 text-[#111827] sm:px-6 lg:px-10"
            : "relative min-h-[calc(100vh-130px)] overflow-hidden bg-[#eef0f5] px-4 py-10 text-[#111827] sm:px-6 lg:px-10"
      }
    >
      {isEmbedded ? (
        <>
          <div className="absolute inset-x-0 bottom-0 h-[300px] bg-[url('/japanparts-reference.png')] bg-[length:1920px_957px] bg-center opacity-35 blur-[2px]" />
          <div className="absolute inset-x-0 bottom-0 h-[300px] bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.62),rgba(0,0,0,0.86)),radial-gradient(circle_at_48%_96%,rgba(239,51,56,0.28),transparent_30%)]" />
        </>
      ) : !isModal ? (
        <>
          <div className="absolute inset-x-0 top-0 h-[285px] bg-[linear-gradient(135deg,#111827_0%,#1c2331_42%,#ef3338_100%)]" />
          <div className="absolute inset-x-0 top-[285px] h-px bg-[#ef3338]" />
        </>
      ) : null}

      <div className={`relative z-10 mx-auto w-full overflow-hidden rounded-[18px] border border-white/50 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)] ${isModal ? "max-h-[calc(100vh-40px)] max-w-[1080px]" : isEmbedded ? "max-w-[1120px]" : "max-w-[1180px]"}`}>
        <div className="relative flex min-h-[96px] items-center justify-between overflow-hidden bg-[#ef3338] px-7 text-white max-sm:min-h-[88px] max-sm:px-5">
          <span className="pointer-events-none absolute inset-y-0 right-0 w-56 bg-[linear-gradient(120deg,transparent,rgba(0,0,0,0.16))]" />
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-[13px] bg-white text-[#111827] shadow-[0_18px_34px_rgba(0,0,0,0.18)]">
              <InquiryIcon name="image" className="size-7 -translate-y-px" />
            </span>
            <div className="min-w-0">
              <h1 className="text-[25px] font-black leading-tight tracking-[-0.02em] max-sm:text-[20px]">
                Can&apos;t Find What You&apos;re Looking For?
              </h1>
              <p className="mt-1.5 max-w-[640px] text-[14px] font-semibold leading-5 text-white/90 max-sm:hidden">
                Upload a reference photo, add vehicle details, and request a clean JPSPARE price quote.
              </p>
            </div>
          </div>
          {isModal ? (
            <button
              type="button"
              onClick={onClose}
              className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-2xl font-light leading-none text-black/75 transition hover:bg-white/20 hover:text-black"
              aria-label="Close parts quote"
            >
              ×
            </button>
          ) : isEmbedded ? (
            <a
              href="#brands"
              className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-2xl font-light leading-none text-black/75 transition hover:bg-white/20 hover:text-black"
              aria-label="Skip parts quote"
            >
              ×
            </a>
          ) : (
            <Link
              href="/"
              className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-2xl font-light leading-none text-black/75 transition hover:bg-white/20 hover:text-black"
              aria-label="Close parts quote"
            >
              ×
            </Link>
          )}
        </div>

        <div className={`grid grid-cols-[0.76fr_1.24fr] bg-[#fafbfc] max-lg:grid-cols-1 ${isModal ? "max-h-[calc(100vh-136px)] overflow-y-auto" : ""}`}>
          <aside className="flex items-center border-r border-[#e6e9ee] bg-white px-7 py-6 max-lg:border-r-0 max-lg:border-b max-lg:items-start max-sm:px-5">
            <div className="space-y-5">
              {steps.map((step, index) => (
                <div key={step.title} className="relative flex gap-4">
                  {index < steps.length - 1 ? <span className="absolute left-4 top-10 h-[44px] w-px bg-[#e0e4ea]" /> : null}
                  <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-[#ef3338] text-white shadow-[0_12px_22px_rgba(239,51,56,0.22)]">
                    <InquiryIcon name="check" />
                  </span>
                  <div className="pt-0.5">
                    <h3 className="text-[15px] font-black text-[#111827]">{step.title}</h3>
                    <p className="mt-1.5 max-w-[360px] text-[13px] font-medium leading-5 text-[#5b6678]">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="px-7 py-6 max-sm:px-5">
            <div className="grid grid-cols-[128px_1fr] gap-5 max-sm:grid-cols-1">
              <div>
                <label className="block text-[12px] font-black uppercase tracking-[0.08em] text-[#111827]" htmlFor="quote-part-image">
                  Add Image
                </label>
                <label
                  htmlFor="quote-part-image"
                  className="mt-2 grid aspect-square w-full cursor-pointer place-items-center overflow-hidden rounded-[14px] border border-dashed border-[#cfd6df] bg-white text-[#8b95a5] transition hover:border-[#ef3338] hover:text-[#ef3338] hover:shadow-[0_14px_28px_rgba(239,51,56,0.10)]"
                >
                  {preview ? (
                    <span className="block size-full bg-cover bg-center" style={{ backgroundImage: `url(${preview})` }} />
                  ) : (
                    <span className="scale-75">
                      <InquiryIcon name="image" />
                    </span>
                  )}
                  <input id="quote-part-image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-[0.08em] text-[#111827]" htmlFor="quote-part-name">
                    Part Name
                  </label>
                  <input
                    id="quote-part-name"
                    name="partName"
                    type="text"
                    placeholder="Example: Brake pad, headlight, oil filter"
                    className="mt-2 h-11 w-full rounded-[10px] border border-[#d7dde6] bg-white px-4 text-[15px] font-semibold text-[#111827] outline-none transition placeholder:text-[#98a2b3] hover:border-[#f7d95f] focus:border-[#ef3338] focus:shadow-[0_0_0_4px_rgba(239,51,56,0.08)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  <div>
                    <label className="block text-[12px] font-black uppercase tracking-[0.08em] text-[#111827]" htmlFor="quote-vehicle">
                      Vehicle
                    </label>
                    <input
                      id="quote-vehicle"
                      name="vehicle"
                      type="text"
                      placeholder="Toyota Premio 2018"
                      className="mt-2 h-11 w-full rounded-[10px] border border-[#d7dde6] bg-white px-4 text-[15px] font-semibold text-[#111827] outline-none transition placeholder:text-[#98a2b3] hover:border-[#f7d95f] focus:border-[#ef3338] focus:shadow-[0_0_0_4px_rgba(239,51,56,0.08)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-black uppercase tracking-[0.08em] text-[#111827]" htmlFor="quote-phone">
                      Contact
                    </label>
                    <input
                      id="quote-phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone or email"
                      className="mt-2 h-11 w-full rounded-[10px] border border-[#d7dde6] bg-white px-4 text-[15px] font-semibold text-[#111827] outline-none transition placeholder:text-[#98a2b3] hover:border-[#f7d95f] focus:border-[#ef3338] focus:shadow-[0_0_0_4px_rgba(239,51,56,0.08)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <label className="mt-4 block text-[12px] font-black uppercase tracking-[0.08em] text-[#111827]" htmlFor="quote-part-info">
              Additional Information
            </label>
            <textarea
              id="quote-part-info"
              name="partInfo"
              placeholder="Describe the part, quantity, chassis number, urgency, or any reference details"
              rows={4}
              className="mt-2 w-full resize-none rounded-[12px] border border-[#d7dde6] bg-white px-4 py-3 text-[15px] font-semibold text-[#111827] outline-none transition placeholder:text-[#98a2b3] hover:border-[#f7d95f] focus:border-[#ef3338] focus:shadow-[0_0_0_4px_rgba(239,51,56,0.08)]"
            />

            <div className="mt-5 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
              <p className="text-[12px] font-semibold leading-5 text-[#647084]">
                Quote requests are reviewed by the JPSPARE team before confirmation.
              </p>
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-3 rounded-[12px] bg-[#ef3338] px-7 text-[15px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d3191d] max-sm:w-full"
              >
                Ask For Price
                <span>→</span>
              </button>
            </div>

            {message ? (
              <p className="mt-4 rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[13px] font-black text-[#15803d]">
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
