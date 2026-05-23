"use client";

import { useEffect, useState } from "react";

function normalizeSlides(slides) {
  if (!Array.isArray(slides)) return [];

  return slides
    .filter((slide) => slide && slide.active !== false && (slide.desktopImage || slide.src))
    .map((slide) => ({
      src: slide.desktopImage || slide.src,
      mobileSrc: slide.mobileImage || slide.desktopImage || slide.src,
      alt: slide.alt || slide.heading || "JPSPARE hero banner",
    }));
}

export default function HeroBannerSlider({ fallbackSlides = [] }) {
  const [slides, setSlides] = useState(() => normalizeSlides(fallbackSlides));

  useEffect(() => {
    let mounted = true;

    fetch("/api/homepage", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted) return;

        const section = payload?.cms?.heroSlider;
        if (section?.enabled === false) return;

        const cmsSlides = normalizeSlides(section?.slides);
        if (cmsSlides.length) setSlides(cmsSlides);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const displaySlides = slides.length ? slides : normalizeSlides(fallbackSlides);

  if (!displaySlides.length) return null;

  return (
    <div className="hero-banner-slider relative h-[620px] w-full max-lg:h-[430px] max-sm:h-[265px]">
      {displaySlides.map((slide, index) => (
        <picture key={`${slide.src}-${index}`}>
          <source media="(max-width: 640px)" srcSet={slide.mobileSrc || slide.src} />
          <img
            src={slide.src}
            alt={slide.alt}
            className="hero-banner-slide absolute inset-0 h-full w-full object-cover"
            style={{ "--slide-index": index }}
          />
        </picture>
      ))}
    </div>
  );
}
