"use client";

import { useEffect, useState } from "react";

const demoHeroSources = new Set([
  "/jpspare-hero-slide-1.gif",
  "/jpspare-hero-slide-2.png",
  "/jpspare-hero-slide-3.jpg",
]);

function isDemoHeroSlide(slide) {
  const desktopImage = slide?.desktopImage || slide?.src || "";
  const mobileImage = slide?.mobileImage || "";
  return demoHeroSources.has(desktopImage) || demoHeroSources.has(mobileImage);
}

function normalizeSlides(slides, options = {}) {
  if (!Array.isArray(slides)) return [];

  const activeSlides = slides
    .filter((slide) => slide && slide.active !== false && (slide.desktopImage || slide.src));

  const hasCustomSlide = activeSlides.some((slide) => !isDemoHeroSlide(slide));
  const filteredSlides = options.stripDemoWhenCustom && hasCustomSlide
    ? activeSlides.filter((slide) => !isDemoHeroSlide(slide))
    : activeSlides;

  return filteredSlides.map((slide) => ({
      src: slide.desktopImage || slide.src,
      mobileSrc: slide.mobileImage || slide.desktopImage || slide.src,
      alt: slide.alt || slide.heading || "JPSPARE hero banner",
    }));
}

export default function HeroBannerSlider({ fallbackSlides = [], className = "" }) {
  const [slides, setSlides] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    fetch("/api/homepage", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted) return;

        const section = payload?.cms?.heroSlider;
        if (section?.enabled === false) {
          setSlides([]);
          return;
        }

        const cmsSlides = normalizeSlides(section?.slides, { stripDemoWhenCustom: true });
        setSlides(cmsSlides.length ? cmsSlides : normalizeSlides(fallbackSlides));
      })
      .catch(() => {
        if (mounted) setSlides(normalizeSlides(fallbackSlides));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const displaySlides = Array.isArray(slides) ? slides : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [displaySlides.length]);

  useEffect(() => {
    if (displaySlides.length <= 1) return undefined;

    const slideTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % displaySlides.length);
    }, 15000);

    return () => {
      window.clearInterval(slideTimer);
    };
  }, [displaySlides.length]);

  return (
    <div className={`hero-banner-slider relative h-[620px] w-full max-lg:h-[430px] max-sm:h-[265px] ${className}`}>
      {!Array.isArray(slides) || !displaySlides.length ? (
        <div className="absolute inset-0 bg-[#040404]" />
      ) : null}
      {displaySlides.map((slide, index) => (
        <picture key={`${slide.src}-${index}`}>
          <source media="(max-width: 640px)" srcSet={slide.mobileSrc || slide.src} />
          <img
            src={slide.src}
            alt={slide.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        </picture>
      ))}
      {displaySlides.length > 1 ? (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 max-sm:bottom-3 max-sm:gap-1.5">
          {displaySlides.map((slide, index) => (
            <button
              key={`${slide.src}-indicator-${index}`}
              type="button"
              aria-label={`Show hero banner ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-[4px] w-9 rounded-full transition-colors duration-300 max-sm:w-6 ${
                index === activeIndex
                  ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                  : "bg-white/55 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
