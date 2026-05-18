"use client";

import { useState } from "react";

function InquiryIcon({ name }) {
  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "image") {
    return (
      <svg viewBox="0 0 80 80" className="size-16" fill="none" stroke="currentColor" strokeWidth="3">
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

export default function PartsInquirySection() {
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("Demo quote request submitted. JPSPARE team will contact you soon.");
  }

  return (
    <section id="parts-inquiry" className="relative bg-white pb-20">
      <div className="h-[328px] bg-[url('/product-detail-reference.jpg')] bg-cover bg-center">
        <div className="h-full bg-black/10" />
      </div>

      <div className="relative z-10 mx-auto -mt-[268px] w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 max-lg:-mt-[230px]">
        <div className="rounded-[8px] bg-white p-[60px] shadow-[0_20px_55px_rgba(15,23,42,0.10)] max-md:p-8 max-sm:p-5">
          <div className="grid grid-cols-[1fr_1.15fr] gap-6 max-lg:grid-cols-1">
            <div className="pr-10 max-lg:pr-0">
              <h2 className="text-[34px] font-black leading-[1.18] tracking-[-0.04em] text-black max-sm:text-[28px]">
                Can&apos;t Find What You&apos;re Looking For?
              </h2>

              <div className="mt-8 space-y-8">
                {steps.map((step, index) => (
                  <div key={step.title} className="relative flex gap-3">
                    {index < steps.length - 1 ? <span className="absolute left-[13px] top-8 h-[64px] w-px bg-[#d6d6d6]" /> : null}
                    <span className="relative z-10 grid size-[24px] shrink-0 place-items-center rounded-full bg-[#f47b20] text-white">
                      <InquiryIcon name="check" />
                    </span>
                    <div>
                      <h3 className="text-[16px] font-black text-black">{step.title}</h3>
                      <p className="mt-3 max-w-[360px] text-[15px] leading-[1.65] text-black">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="border-l border-[#d7d7d7] pl-6 max-lg:border-l-0 max-lg:border-t max-lg:pl-0 max-lg:pt-8">
              <label className="block text-[13px] font-semibold text-black" htmlFor="part-image">
                Add Image
              </label>
              <label
                htmlFor="part-image"
                className="mt-2 grid size-[100px] cursor-pointer place-items-center border border-dashed border-[#c7c7c7] text-[#7b7b7b] transition hover:border-[#f47b20] hover:text-[#f47b20]"
              >
                {preview ? (
                  <span className="block size-full bg-cover bg-center" style={{ backgroundImage: `url(${preview})` }} />
                ) : (
                  <InquiryIcon name="image" />
                )}
                <input id="part-image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
              </label>

              <label className="mt-7 block text-[13px] font-semibold text-black" htmlFor="part-name">
                Part Name
              </label>
              <input
                id="part-name"
                name="partName"
                type="text"
                placeholder="Description of the part"
                className="mt-2 h-[50px] w-full rounded-[2px] border border-[#d0d0d0] px-3 text-[16px] text-black outline-none transition placeholder:text-[#777] focus:border-[#f47b20]"
              />

              <label className="mt-6 block text-[13px] font-semibold text-black" htmlFor="part-info">
                Additional Information
              </label>
              <textarea
                id="part-info"
                name="partInfo"
                placeholder="Your vehicle make, model and year"
                rows={3}
                className="mt-2 w-full resize-none rounded-[2px] border border-[#d0d0d0] px-3 py-3 text-[16px] text-black outline-none transition placeholder:text-[#777] focus:border-[#f47b20]"
              />

              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="h-[50px] rounded-[3px] bg-[#eb741d] px-8 text-[15px] font-black text-white transition hover:bg-[#d3191d]"
                >
                  Ask For Price
                </button>
              </div>

              {message ? <p className="mt-4 text-center text-[13px] font-semibold text-[#0f8f49]">{message}</p> : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
