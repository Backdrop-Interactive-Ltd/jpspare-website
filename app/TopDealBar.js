"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getHomepageClientData } from "@/lib/homepage/client-cache";

const AUTO_WAIT_MS = 10450;
const SLIDE_DURATION_MS = 700;
const DRAG_THRESHOLD = 44;

const dealMessages = [
  <>
    Today deal sale off <span className="font-black">80%</span>. End in <DealButtonText text="Hurry Up →" />
  </>,
  <>
    Shop over <span className="font-black">7000</span> Tk get free delivery
  </>,
];

function DealButtonText({ text }) {
  const value = String(text || "").trim();
  if (!value) return null;
  const hasArrow = /→$/.test(value);
  const label = hasArrow ? value.replace(/\s*→$/, "") : value;

  return (
    <span className="group/hurry inline-flex items-center gap-1 align-baseline font-extrabold text-white transition-colors duration-200 hover:text-[#ef3338]">
      <span>{label}</span>
      {hasArrow ? (
        <span aria-hidden="true" className="inline-block transition-transform duration-200 ease-out group-hover/hurry:translate-x-1">
          →
        </span>
      ) : null}
    </span>
  );
}

function renderDealMessage(text) {
  const value = String(text || "");
  const parts = value.split(/(70%|80%|7000)/gi);

  return parts.map((part, index) => {
    if (part === "70%" || part === "80%" || part === "7000") {
      return (
        <span key={`${part}-${index}`} className="font-extrabold">
          {part}
        </span>
      );
    }

    return part;
  });
}

export default function TopDealBar({ announcement }) {
  const [visible, setVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [remoteAnnouncement, setRemoteAnnouncement] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState(null);
  const [suppressSettledTransition, setSuppressSettledTransition] = useState(false);
  const dragStartX = useRef(0);
  const draggedEnoughToCancelClick = useRef(false);
  const autoTimer = useRef(null);
  const slideStartTimer = useRef(null);
  const slideFinishTimer = useRef(null);
  const activeAnnouncement = announcement ?? remoteAnnouncement;
  const messages =
    activeAnnouncement && activeAnnouncement.enabled === false
      ? []
      : activeAnnouncement
        ? [
            activeAnnouncement.text
              ? (
                  <>
                    {renderDealMessage(activeAnnouncement.text)}
                    {activeAnnouncement.buttonText ? <> <DealButtonText text={activeAnnouncement.buttonText} /></> : null}
                  </>
                )
              : null,
            activeAnnouncement.secondaryText ? renderDealMessage(activeAnnouncement.secondaryText) : null,
          ].filter(Boolean)
        : dealMessages;
  const link = activeAnnouncement?.buttonLink || "#sale";
  const autoWaitMs = Math.max(2500, Math.min(30000, Number(activeAnnouncement?.rotationIntervalMs) || AUTO_WAIT_MS));
  const currentIndex = messages.length ? Math.min(messageIndex, messages.length - 1) : 0;

  const clearAutoTimer = useCallback(() => {
    window.clearTimeout(autoTimer.current);
  }, []);

  const clearSlideTimers = useCallback(() => {
    window.clearTimeout(slideStartTimer.current);
    window.clearTimeout(slideFinishTimer.current);
  }, []);

  const startSlide = useCallback((direction) => {
    if (transition || messages.length <= 1) return;

    clearAutoTimer();
    clearSlideTimers();

    const toIndex = (currentIndex + (direction === "left" ? 1 : messages.length - 1)) % messages.length;

    setTransition({ direction, toIndex, active: false });

    slideStartTimer.current = window.setTimeout(() => {
      setTransition((current) => (current ? { ...current, active: true } : current));
    }, 20);

    slideFinishTimer.current = window.setTimeout(() => {
      setSuppressSettledTransition(true);
      setMessageIndex(toIndex);
      setTransition(null);
    }, SLIDE_DURATION_MS);
  }, [clearAutoTimer, clearSlideTimers, currentIndex, messages.length, transition]);

  useEffect(() => {
    if (announcement !== undefined) return undefined;

    let mounted = true;

    getHomepageClientData()
      .then((payload) => {
        if (mounted && payload?.cms?.announcement) setRemoteAnnouncement(payload.cms.announcement);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [announcement]);

  useEffect(() => {
    clearAutoTimer();

    if (!visible || messages.length <= 1 || isDragging || transition) {
      return clearAutoTimer;
    }

    autoTimer.current = window.setTimeout(() => {
      startSlide("left");
    }, autoWaitMs);

    return clearAutoTimer;
  }, [autoWaitMs, clearAutoTimer, isDragging, messages.length, startSlide, transition, visible]);

  useEffect(() => {
    return () => {
      clearAutoTimer();
      clearSlideTimers();
    };
  }, [clearAutoTimer, clearSlideTimers]);

  useEffect(() => {
    if (!suppressSettledTransition) return undefined;

    const timer = window.setTimeout(() => {
      setSuppressSettledTransition(false);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [suppressSettledTransition]);

  if (!visible || !messages.length) {
    return null;
  }

  const outgoingClass = transition?.active
    ? transition.direction === "left"
      ? "-translate-x-[130vw] opacity-0"
      : "translate-x-[130vw] opacity-0"
    : "translate-x-0 opacity-100";
  const incomingClass = transition?.active
    ? "translate-x-0 opacity-100"
    : transition?.direction === "left"
      ? "translate-x-[130vw] opacity-0"
      : "-translate-x-[130vw] opacity-0";

  function handlePointerDown(event) {
    if (transition) return;

    clearAutoTimer();
    dragStartX.current = event.clientX;
    draggedEnoughToCancelClick.current = false;
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!isDragging) return;

    const nextOffset = event.clientX - dragStartX.current;
    if (Math.abs(nextOffset) > 8) draggedEnoughToCancelClick.current = true;
    setDragOffset(Math.max(-220, Math.min(220, nextOffset)));
  }

  function handlePointerUp(event) {
    if (!isDragging) return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const movedBy = event.clientX - dragStartX.current;
    setIsDragging(false);
    setDragOffset(0);

    if (Math.abs(movedBy) >= DRAG_THRESHOLD) {
      startSlide(movedBy < 0 ? "left" : "right");
    }
  }

  return (
    <div className="relative z-50 flex h-11 items-center justify-center overflow-hidden bg-[#111827] px-14 text-white">
      <a
        href={link}
        className={`top-deal-text touch-pan-y select-none whitespace-nowrap text-center text-[16px] font-bold leading-none transition-all ease-in-out max-sm:text-[14px] ${
          isDragging || suppressSettledTransition ? "cursor-grabbing duration-0" : `cursor-grab duration-700 ${outgoingClass}`
        }`}
        style={isDragging ? { transform: `translateX(${dragOffset}px)`, opacity: Math.max(0.45, 1 - Math.abs(dragOffset) / 260) } : undefined}
        draggable={false}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(event) => {
          if (draggedEnoughToCancelClick.current) {
            event.preventDefault();
            draggedEnoughToCancelClick.current = false;
          }
        }}
      >
        {messages[currentIndex]}
      </a>
      {transition ? (
        <a
          href={link}
          className={`top-deal-text pointer-events-none absolute inset-x-14 top-1/2 flex -translate-y-1/2 justify-center whitespace-nowrap text-center text-[16px] font-bold leading-none transition-all duration-700 ease-in-out max-sm:text-[14px] ${incomingClass}`}
          aria-hidden="true"
          tabIndex={-1}
        >
          {messages[transition.toIndex]}
        </a>
      ) : null}
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="group/close-deal absolute right-[15px] top-1/2 flex h-6 -translate-y-1/2 items-center gap-1 text-[13px] font-bold leading-none text-white transition hover:text-[#ff6268]"
        aria-label="Close deal banner"
      >
        <span className="grid size-[18px] place-items-center text-[18px] font-normal leading-none transition-transform duration-200 ease-out group-hover/close-deal:rotate-90 group-hover/close-deal:scale-110">×</span>
        <span className="leading-none">close</span>
      </button>
    </div>
  );
}
