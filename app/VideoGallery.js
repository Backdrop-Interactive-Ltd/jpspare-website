"use client";

import { useState } from "react";

const videos = [
  {
    title: "Customer Testimonials - Toyota Harrier 2014 Parts from Japan",
    tag: "TUTORIAL",
    tagTone: "blue",
    duration: "1:00",
    views: "55",
    code: "TOYOTA-HARRIER-2014",
    image: "/japanparts-reference.png",
    position: "36% 36%",
  },
  {
    title: "JPSPARE Flagship Store Launching Offer - Upto 50% Off",
    tag: "TUTORIAL",
    tagTone: "blue",
    duration: "1:00",
    views: "399",
    code: "FLAGSHIP-OFFER-2025",
    image: "/japanparts-reference.png",
    position: "64% 28%",
    isNew: true,
  },
  {
    title: "Get the BEST Brake Performance with BREMBO Pads",
    tag: "REVIEW",
    tagTone: "purple",
    duration: "11:20",
    views: "157",
    code: "BREMBO-BP-001",
    image: "/products-reference.png",
    position: "58% 42%",
  },
  {
    title: "How to Choose Genuine Japanese Engine Oil",
    tag: "GUIDE",
    tagTone: "red",
    duration: "4:35",
    views: "221",
    code: "ENGINE-OIL-GUIDE",
    image: "/black-odor-green-console.jpg",
    position: "center",
  },
  {
    title: "Premium Accessories Setup for Daily Driving",
    tag: "TUTORIAL",
    tagTone: "blue",
    duration: "6:10",
    views: "184",
    code: "ACCESSORIES-SETUP",
    image: "/black-odor-red-console.jpg",
    position: "center",
  },
  {
    title: "Tyre Care Tips for Bangladesh Roads",
    tag: "REVIEW",
    tagTone: "purple",
    duration: "8:24",
    views: "312",
    code: "TYRE-CARE-BD",
    image: "/product-detail-reference.jpg",
    position: "44% 34%",
  },
];

function wrapIndex(index) {
  return (index + videos.length) % videos.length;
}

function VideoIcon({ name }) {
  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </svg>
    );
  }

  if (name === "play") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        <path d="M8 5v14l11-7L8 5Z" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  if (name === "trend") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 17 9 11l4 4 7-8" />
        <path d="M14 7h6v6" />
      </svg>
    );
  }

  return null;
}

function VideoCard({ video, active, onPlay }) {
  const tagClass =
    video.tagTone === "purple"
      ? "bg-[#8b3df3] text-white"
      : video.tagTone === "red"
        ? "bg-[#ef4444] text-white"
        : "bg-[#2f72f6] text-white";

  return (
    <article
      className={[
        "group relative shrink-0 overflow-hidden rounded-[14px] border bg-[#121827] text-left transition duration-500",
        active
          ? "w-[min(368px,86vw)] border-[#ff6267] shadow-[0_28px_72px_rgba(239,68,68,0.32)] md:scale-105"
          : "w-[min(328px,82vw)] border-[#243044] opacity-75 shadow-[0_18px_45px_rgba(0,0,0,0.28)] hover:opacity-100",
      ].join(" ")}
    >
      <div
        className="relative h-[186px] bg-cover bg-center"
        style={{ backgroundImage: `url(${video.image})`, backgroundPosition: video.position }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/20 to-black/65" />
        {video.isNew ? (
          <span className="absolute left-5 top-5 rounded-full bg-[#ff555d] px-4 py-3 text-[12px] font-black uppercase tracking-wide text-black">
            New
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => onPlay(video)}
          className={[
            "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#f15a5e]/90 text-[#101827] shadow-[0_14px_30px_rgba(239,68,68,0.36)] transition hover:bg-[#ff686c]",
            active ? "size-[72px]" : "size-[58px]",
          ].join(" ")}
          aria-label={`Play ${video.title}`}
        >
          <VideoIcon name="play" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-black uppercase tracking-wide ${tagClass}`}>
            <VideoIcon name="play" />
            {video.tag}
          </span>
          <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[12px] font-semibold text-white">
            {video.duration}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <h3 className="min-h-[44px] text-[16px] font-black leading-snug text-white md:text-[17px]">{video.title}</h3>
        <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-[#7f8999]">
          <span className="inline-flex items-center gap-1.5">⊙ {video.views}</span>
          <span className="inline-flex items-center gap-1.5 text-[#ff6267]">⌘ {video.code}</span>
        </div>

        {active ? (
          <button
            type="button"
            onClick={() => onPlay(video)}
            className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#ff4d52] text-[14px] font-black text-[#111827] shadow-[0_14px_30px_rgba(239,68,68,0.22)] transition hover:bg-[#ff6569]"
          >
            <VideoIcon name="play" />
            Watch Video
            <VideoIcon name="arrow" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default function VideoGallery() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const visibleIndexes = [activeIndex - 1, activeIndex, activeIndex + 1].map(wrapIndex);

  const goPrev = () => setActiveIndex((current) => wrapIndex(current - 1));
  const goNext = () => setActiveIndex((current) => wrapIndex(current + 1));

  return (
    <section id="video-gallery" className="relative overflow-hidden bg-[#070b12] py-20 text-white md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:80px_80px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(42,58,86,0.62),transparent_45%),linear-gradient(90deg,rgba(16,24,39,0.96),rgba(4,7,12,0.98))]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className="text-[44px] font-black leading-tight tracking-[-0.02em] text-white md:text-[72px]">
            JPSPARE Video Gallery
          </h2>
          <span className="mx-auto mt-9 block h-2 w-32 rounded-full bg-gradient-to-r from-[#ffd447] via-[#ff7667] to-[#ff4247]" />
          <p className="mx-auto mt-10 max-w-[650px] text-[22px] leading-relaxed text-white/75 md:text-[28px]">
            Product reviews, customer testimonials, and latest updates from JPSPARE
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-7 text-[15px] font-bold text-white/55">
            {[
              ["shield", "Professional Quality"],
              ["eye", "Step-by-Step"],
              ["star", "Expert Approved"],
            ].map(([icon, label]) => (
              <span key={label} className="inline-flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#ff5a61]/20 text-[#ff6267]">
                  <VideoIcon name={icon} />
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-20 flex items-center justify-center">
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-0 z-10 hidden size-14 place-items-center rounded-[16px] border border-white/10 bg-[#142033]/85 text-white/70 shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition hover:border-[#ff6267]/55 hover:text-white lg:grid"
            aria-label="Previous video"
          >
            <span className="rotate-180">
              <VideoIcon name="arrow" />
            </span>
          </button>

          <div className="flex w-full items-center gap-8 overflow-x-auto px-2 pb-5 md:justify-center md:overflow-visible">
            {visibleIndexes.map((videoIndex) => (
              <VideoCard
                key={`${videos[videoIndex].code}-${videoIndex}`}
                video={videos[videoIndex]}
                active={videoIndex === activeIndex}
                onPlay={setSelectedVideo}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-0 z-10 hidden size-14 place-items-center rounded-[16px] border border-white/10 bg-[#142033]/85 text-white/70 shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition hover:border-[#ff6267]/55 hover:text-white lg:grid"
            aria-label="Next video"
          >
            <VideoIcon name="arrow" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          {videos.map((video, index) => (
            <button
              key={video.code}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={[
                "h-3 rounded-full transition",
                index === activeIndex
                  ? "w-12 bg-[#ff5a61] shadow-[0_0_22px_rgba(255,90,97,0.75)]"
                  : "w-3 bg-[#5b6675] hover:bg-[#ff8c8f]",
              ].join(" ")}
              aria-label={`Show video ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {selectedVideo ? (
        <div className="fixed inset-0 z-[140] grid place-items-center bg-black/85 px-5" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-[820px] overflow-hidden rounded-[18px] border border-white/10 bg-[#101827] shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-black/60 text-2xl font-light text-white transition hover:bg-[#ff4247]"
              aria-label="Close video preview"
            >
              ×
            </button>
            <div
              className="grid min-h-[360px] place-items-center bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedVideo.image})`, backgroundPosition: selectedVideo.position }}
            >
              <div className="grid size-24 place-items-center rounded-full bg-[#ff5a61]/90 text-[#111827] shadow-[0_18px_45px_rgba(239,68,68,0.38)]">
                <VideoIcon name="play" />
              </div>
            </div>
            <div className="p-6">
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#ff6267]">Demo video preview</p>
              <h3 className="mt-2 text-[24px] font-black text-white">{selectedVideo.title}</h3>
              <p className="mt-2 text-[14px] text-white/60">This button is functional with demo content. Real video URLs can be connected later through API data.</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
