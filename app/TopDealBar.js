"use client";

import { useEffect, useState } from "react";

const dealMessages = [
  <>
    Today deal sale off <span className="font-black">70%</span>. End in. Hurry Up →
  </>,
  <>Shop Over 5000 Tk Get FREE Delivery</>,
];

export default function TopDealBar() {
  const [visible, setVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState("entering");

  useEffect(() => {
    if (!visible) return undefined;

    const enterTimer = window.setTimeout(() => setPhase("center"), 450);
    const exitTimer = window.setTimeout(() => setPhase("exiting"), 10450);
    const nextTimer = window.setTimeout(() => {
      setMessageIndex((current) => (current + 1) % dealMessages.length);
      setPhase("entering");
    }, 11200);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(nextTimer);
    };
  }, [messageIndex, visible]);

  if (!visible) {
    return null;
  }

  const phaseClass =
    phase === "center"
      ? "translate-x-0 opacity-100"
      : phase === "exiting"
        ? "-translate-x-[130vw] opacity-0"
        : "translate-x-[130vw] opacity-0";

  return (
    <div className="relative z-50 flex h-11 items-center justify-center overflow-hidden bg-[#111827] px-14 text-white">
      <a
        href="#sale"
        className={`whitespace-nowrap text-center text-[16px] font-semibold leading-none tracking-[-0.01em] transition-all duration-700 ease-in-out ${phaseClass}`}
      >
        {dealMessages[messageIndex]}
      </a>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-[15px] top-1/2 flex -translate-y-1/2 items-center gap-1 text-[13px] font-bold leading-none text-white transition hover:text-[#ff6268]"
        aria-label="Close deal banner"
      >
        <span className="text-[18px] font-normal leading-none">×</span>
        close
      </button>
    </div>
  );
}
