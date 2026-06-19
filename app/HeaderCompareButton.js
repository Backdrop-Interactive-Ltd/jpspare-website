"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PRODUCT_COMPARE_SELECTION_KEY = "jpspare-product-compare-selection";

function CompareIcon({ className = "size-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 17 6-6 4 4 6-8M15 7h5v5" />
    </svg>
  );
}

function readCompareCount() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PRODUCT_COMPARE_SELECTION_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default function HeaderCompareButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function syncCount(event) {
      if (typeof event.detail?.count === "number") {
        setCount(event.detail.count);
      } else {
        setCount(readCompareCount());
      }
    }

    setCount(readCompareCount());
    window.addEventListener("jpspare-compare-change", syncCount);
    window.addEventListener("storage", syncCount);

    return () => {
      window.removeEventListener("jpspare-compare-change", syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  return (
    <Link href="/compare" aria-label="Compare products" title="Compare products" className="header-action-icon relative z-10 grid size-8 place-items-center">
      <CompareIcon />
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#ef3338] text-[11px] font-black leading-none text-white shadow-[0_6px_14px_rgba(239,51,56,0.35)]">{count}</span>
      ) : null}
    </Link>
  );
}
