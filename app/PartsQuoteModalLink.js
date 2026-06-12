"use client";

import { useEffect, useState } from "react";
import PartsInquirySection from "./PartsInquirySection";

export default function PartsQuoteModalLink({ className = "", children = "PARTS QUOTE" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <span className="leading-none">{children}</span>
      </button>

      {open ? <PartsInquirySection mode="modal" onClose={() => setOpen(false)} /> : null}
    </>
  );
}
