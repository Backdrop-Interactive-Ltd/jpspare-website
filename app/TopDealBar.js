"use client";

import { useEffect, useState } from "react";

const dealMessages = [
  <>
    Today deal sale off <span className="font-black">70%</span>. End in. Hurry Up →
  </>,
  <>Shop Over 5000 Tk Get FREE Delivery</>,
];

function renderDealMessage(text) {
  const value = String(text || "");
  if (!value.includes("70%")) return value;
  const [before, after] = value.split("70%");
  return (
    <>
      {before}
      <span className="font-black">70%</span>
      {after}
    </>
  );
}

export default function TopDealBar({ announcement }) {
  const [visible, setVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState("entering");
  const [remoteAnnouncement, setRemoteAnnouncement] = useState(null);
  const activeAnnouncement = announcement ?? remoteAnnouncement;
  const messages =
    activeAnnouncement && activeAnnouncement.enabled === false
      ? []
      : activeAnnouncement
        ? [activeAnnouncement.text, activeAnnouncement.secondaryText].filter(Boolean).map(renderDealMessage)
        : dealMessages;
  const link = activeAnnouncement?.buttonLink || "#sale";

  useEffect(() => {
    if (announcement !== undefined) return undefined;

    let mounted = true;

    fetch("/api/homepage", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload?.cms?.announcement) setRemoteAnnouncement(payload.cms.announcement);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [announcement]);

  useEffect(() => {
    if (!visible || !messages.length) return undefined;

    const enterTimer = window.setTimeout(() => setPhase("center"), 450);
    const exitTimer = window.setTimeout(() => setPhase("exiting"), 10450);
    const nextTimer = window.setTimeout(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
      setPhase("entering");
    }, 11200);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(nextTimer);
    };
  }, [messageIndex, visible, messages.length]);

  if (!visible || !messages.length) {
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
        href={link}
        className={`whitespace-nowrap text-center text-[16px] font-semibold leading-none tracking-[-0.01em] transition-all duration-700 ease-in-out ${phaseClass}`}
      >
        {messages[messageIndex]}
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
