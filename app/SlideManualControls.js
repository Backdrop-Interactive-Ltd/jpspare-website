"use client";

import { useEffect } from "react";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function getLoopCount(shell) {
  const track = shell.querySelector(".new-arrivals-track, .brand-marquee-track");
  const copies = Number(shell.dataset.loopCopies || "2");
  return Math.max(1, Math.floor((track?.children.length || copies) / copies));
}

function getSlideStep(shell) {
  const track = shell.querySelector(".new-arrivals-track, .brand-marquee-track");
  const firstCard = track?.children?.[0];
  if (!track || !firstCard) return 265;
  const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "0");
  return firstCard.getBoundingClientRect().width + (Number.isFinite(gap) ? gap : 0);
}

function normalizeIndex(index, count) {
  return ((index % count) + count) % count;
}

function applySlideIndex(shell, index) {
  shell.dataset.slideIndex = String(index);
  shell.style.setProperty("--slide-manual-index", String(index));
}

function activateManualMode(shell) {
  const count = getLoopCount(shell);
  if (shell.classList.contains("is-manual")) {
    const current = Number(shell.dataset.slideIndex || "0");
    if (current === count || current === -1) return current;
    return normalizeIndex(current, count);
  }

  const track = shell.querySelector(".new-arrivals-track, .brand-marquee-track");
  const matrix = new DOMMatrixReadOnly(window.getComputedStyle(track).transform);
  const currentX = Number.isFinite(matrix.m41) ? matrix.m41 : 0;
  const step = getSlideStep(shell);
  const nearest = normalizeIndex(Math.round(Math.abs(currentX) / step), count);
  shell.style.setProperty("--slide-step-px", `${step}px`);
  shell.classList.add("is-manual", "no-slide-transition");
  applySlideIndex(shell, nearest);
  shell.style.setProperty("--slide-drag-offset", "0px");
  track?.offsetHeight;
  requestAnimationFrame(() => shell.classList.remove("no-slide-transition"));
  return nearest;
}

function scheduleAutoResume(shell, index) {
  window.clearTimeout(shell._slideResumeTimer);
  shell._slideResumeTimer = window.setTimeout(() => {
    if (shell.dataset.keepManual === "true") return;
    const count = getLoopCount(shell);
    const normalized = normalizeIndex(index, count);
    shell.style.setProperty("--slide-manual-offset", `${normalized * 5}s`);
    shell.classList.remove("is-manual", "is-dragging", "no-slide-transition");
  }, 5000);
}

function setLoopingSlideIndex(shell, nextIndex) {
  const count = getLoopCount(shell);
  const track = shell.querySelector(".new-arrivals-track, .brand-marquee-track");
  shell.style.setProperty("--slide-step-px", `${getSlideStep(shell)}px`);
  window.clearTimeout(shell._slideResetTimer);
  window.clearTimeout(shell._slideResumeTimer);
  shell.classList.add("is-manual");
  shell.style.setProperty("--slide-drag-offset", "0px");

  if (nextIndex >= count) {
    const targetIndex = nextIndex;
    const resetIndex = normalizeIndex(nextIndex, count);
    applySlideIndex(shell, targetIndex);
    shell._slideResetTimer = window.setTimeout(() => {
      shell.classList.add("no-slide-transition");
      track?.offsetHeight;
      applySlideIndex(shell, resetIndex);
      track?.offsetHeight;
      window.setTimeout(() => {
        shell.classList.remove("no-slide-transition");
        window.clearTimeout(shell._slideResetTimer);
        scheduleAutoResume(shell, resetIndex);
      }, 50);
    }, 780);
    return;
  }

  if (nextIndex < 0) {
    const resetIndex = normalizeIndex(nextIndex, count);
    shell.classList.add("no-slide-transition");
    applySlideIndex(shell, count);
    track?.offsetHeight;
    requestAnimationFrame(() => {
      shell.classList.remove("no-slide-transition");
      applySlideIndex(shell, resetIndex);
      scheduleAutoResume(shell, resetIndex);
    });
    return;
  }

  applySlideIndex(shell, nextIndex);
  scheduleAutoResume(shell, nextIndex);
}

export default function SlideManualControls({ step = 4, className = "" }) {
  useEffect(() => {
    const shells = Array.from(document.querySelectorAll(".new-arrivals-showcase, .brand-marquee"));
    const cleanups = shells.map((shell) => {
      if (shell.dataset.dragReady === "true") return null;
      shell.dataset.dragReady = "true";

      const viewport = shell.querySelector(".new-arrivals-viewport") || shell;
      if (!viewport) return null;

      let startX = 0;
      let startIndex = 0;
      let isPointerDown = false;
      let didDrag = false;

      function pointerDown(event) {
        if (event.button !== undefined && event.button !== 0) return;
        isPointerDown = true;
        didDrag = false;
        startX = event.clientX;
        startIndex = activateManualMode(shell);
        shell.classList.add("is-manual", "is-dragging");
        viewport.setPointerCapture?.(event.pointerId);
      }

      function pointerMove(event) {
        if (!isPointerDown) return;
        const deltaX = event.clientX - startX;
        if (Math.abs(deltaX) > 5) didDrag = true;
        shell.style.setProperty("--slide-drag-offset", `${deltaX}px`);
      }

      function pointerUp(event) {
        if (!isPointerDown) return;
        const deltaX = event.clientX - startX;
        const threshold = 55;
        const direction = deltaX < -threshold ? 1 : deltaX > threshold ? -1 : 0;
        const count = getLoopCount(shell);
        const safeStartIndex = startIndex >= count ? 0 : startIndex < 0 ? count - 1 : startIndex;
        setLoopingSlideIndex(shell, safeStartIndex + direction);
        shell.style.setProperty("--slide-drag-offset", "0px");
        shell.classList.remove("is-dragging");
        viewport.releasePointerCapture?.(event.pointerId);
        isPointerDown = false;
      }

      function clickCapture(event) {
        if (!didDrag) return;
        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
      }

      function productClickCapture(event) {
        if (didDrag) return;
        if (!event.target.closest(".product-card-shell a, .product-card-shell button, .brand-marquee-track a")) return;
        shell.dataset.keepManual = "true";
        window.clearTimeout(shell._slideResumeTimer);
        activateManualMode(shell);
      }

      viewport.addEventListener("pointerdown", pointerDown);
      viewport.addEventListener("pointermove", pointerMove);
      viewport.addEventListener("pointerup", pointerUp);
      viewport.addEventListener("pointercancel", pointerUp);
      viewport.addEventListener("click", clickCapture, true);
      viewport.addEventListener("click", productClickCapture, true);

      return () => {
        viewport.removeEventListener("pointerdown", pointerDown);
        viewport.removeEventListener("pointermove", pointerMove);
        viewport.removeEventListener("pointerup", pointerUp);
        viewport.removeEventListener("pointercancel", pointerUp);
        viewport.removeEventListener("click", clickCapture, true);
        viewport.removeEventListener("click", productClickCapture, true);
        delete shell.dataset.dragReady;
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
    };
  }, []);

  function move(event, direction) {
    const shell = event.currentTarget.closest(".manual-slide-shell");
    if (!shell) return;

    if (shell.classList.contains("new-arrivals-showcase") || shell.classList.contains("brand-marquee")) {
      const count = getLoopCount(shell);
      let current = activateManualMode(shell);
      if (current >= count) current = 0;
      if (current < 0) current = count - 1;
      setLoopingSlideIndex(shell, current + direction * step);
      return;
    }

    const current = Number(shell.dataset.slideOffset || "0");
    const next = current + direction * step;
    shell.dataset.slideOffset = String(next);
    shell.style.setProperty("--slide-manual-offset", `${next}s`);
  }

  return (
    <>
      <button type="button" onClick={(event) => move(event, -1)} className={`manual-slide-control manual-slide-control-prev ${className}`} aria-label="Previous slide">
        <ArrowIcon />
      </button>
      <button type="button" onClick={(event) => move(event, 1)} className={`manual-slide-control manual-slide-control-next ${className}`} aria-label="Next slide">
        <span className="manual-slide-control-next-icon">
          <ArrowIcon />
        </span>
      </button>
    </>
  );
}
