"use client";

import { useState } from "react";

export default function TopDealBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="relative z-50 flex h-11 items-center justify-center bg-[#050505] px-14 text-white">
      <a href="#sale" className="text-center text-[16px] font-black leading-none tracking-[-0.01em]">
        Today deal sale off 70%. End in. Hurry Up →
      </a>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-[15px] top-1/2 flex -translate-y-1/2 items-center gap-1 text-[13px] font-bold leading-none text-white transition hover:text-[#ffe5ee]"
        aria-label="Close deal banner"
      >
        <span className="text-[18px] font-normal leading-none">×</span>
        close
      </button>
    </div>
  );
}
