"use client";

import { useEffect, useMemo, useState } from "react";

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

  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 21l-4.3-4.3" />
        <circle cx="10.5" cy="10.5" r="7.5" />
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
        "group relative shrink-0 overflow-hidden rounded-[8px] border bg-[#121827] text-left transition duration-300",
        active
          ? "w-[min(392px,86vw)] border-[#ef3338] shadow-[0_18px_34px_rgba(15,23,42,0.22),0_10px_22px_rgba(239,51,56,0.10)] md:scale-[1.03]"
          : "w-[min(344px,82vw)] border-[#243044] opacity-80 shadow-[0_18px_45px_rgba(0,0,0,0.24)] hover:opacity-100",
      ].join(" ")}
    >
      <div
        className="relative h-[206px] bg-cover bg-center"
        style={{ backgroundImage: `url(${video.image})`, backgroundPosition: video.position }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/20 to-black/65" />
        {video.isNew ? (
          <span className="absolute left-5 top-5 rounded-[8px] bg-[#ef3338] px-4 py-2.5 text-[12px] font-black uppercase tracking-wide text-white">
            New
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => onPlay(video)}
          className={[
            "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ef3338]/92 text-white shadow-[0_14px_30px_rgba(239,51,56,0.34)] transition hover:scale-105 hover:bg-[#ff4a50]",
            active ? "size-[70px]" : "size-[56px]",
          ].join(" ")}
          aria-label={`Play ${video.title}`}
        >
          <VideoIcon name="play" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-2 rounded-[7px] px-3 py-2 text-[12px] font-black uppercase tracking-wide ${tagClass}`}>
            <VideoIcon name="play" />
            {video.tag}
          </span>
          <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[12px] font-semibold text-white">
            {video.duration}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <h3 className="min-h-[48px] text-[18px] font-black leading-snug text-white">{video.title}</h3>
        <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-[#7f8999]">
          <span className="inline-flex items-center gap-1.5">⊙ {video.views}</span>
          <span className="inline-flex items-center gap-1.5 text-[#ff6267]">⌘ {video.code}</span>
        </div>

        {active ? (
          <button
            type="button"
            onClick={() => onPlay(video)}
            className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#ef3338] text-[14px] font-black text-white shadow-[0_14px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d3191d]"
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

function GridVideoCard({ video, onPlay }) {
  const tagClass =
    video.tagTone === "purple"
      ? "bg-[#8b3df3]"
      : video.tagTone === "red"
        ? "bg-[#ef4444]"
        : "bg-[#2f72f6]";

  return (
    <article className="group grid overflow-hidden rounded-[8px] border border-[#e0e6ee] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#ef3338]/45 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)] md:grid-cols-[260px_1fr]">
      <button
        type="button"
        onClick={() => onPlay(video)}
        className="relative min-h-[210px] overflow-hidden bg-cover bg-center text-left md:min-h-full"
        style={{ backgroundImage: `url(${video.image})`, backgroundPosition: video.position }}
        aria-label={`Play ${video.title}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/25 to-black/70 transition duration-300 group-hover:bg-black/20" />
        <span className={`absolute left-5 top-5 inline-flex items-center gap-2 rounded-[7px] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white ${tagClass}`}>
          <VideoIcon name="play" />
          {video.tag}
        </span>
        <span className="absolute bottom-5 right-5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[12px] font-bold text-white">
          {video.duration}
        </span>
        <span className="absolute left-1/2 top-1/2 grid size-[58px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ef3338]/92 text-white shadow-[0_14px_28px_rgba(239,51,56,0.35)] transition duration-300 group-hover:scale-110 group-hover:bg-[#ff4a50]">
          <VideoIcon name="play" />
        </span>
      </button>

      <div className="flex min-h-[210px] flex-col p-6">
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-bold uppercase tracking-[0.04em] text-[#667085]">
          <span className="inline-flex items-center gap-1.5">
            <VideoIcon name="eye" />
            {video.views} views
          </span>
          <span className="text-[#ef3338]">{video.code}</span>
        </div>
        <h3 className="mt-4 text-[22px] font-black leading-tight text-[#111827]">{video.title}</h3>
        <p className="mt-3 line-clamp-2 text-[14px] font-medium leading-6 text-[#667085]">
          Watch JPSPARE automotive videos, product insights, and expert guidance for better buying decisions.
        </p>
        <button
          type="button"
          onClick={() => onPlay(video)}
          className="mt-auto inline-flex h-11 w-fit items-center gap-2 rounded-[8px] bg-[#111827] px-5 text-[13px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#ef3338]"
        >
          Watch Video
          <VideoIcon name="arrow" />
        </button>
      </div>
    </article>
  );
}

export default function VideoGallery() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [query, setQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [visibleGridCount, setVisibleGridCount] = useState(4);
  const filteredVideos = useMemo(() => {
    if (!query) return videos;

    const term = query.toLowerCase();
    return videos.filter((video) => {
      const categoryMatch =
        term === "offers"
          ? video.title.toLowerCase().includes("offer") || video.code.toLowerCase().includes("offer")
          : video.tag.toLowerCase() === term;
      const searchMatch = `${video.title} ${video.tag} ${video.code}`.toLowerCase().includes(term);

      return categoryMatch || searchMatch;
    });
  }, [query]);
  const safeActiveIndex = filteredVideos.length ? activeIndex % filteredVideos.length : 0;
  const displayedGridVideos = filteredVideos.slice(0, visibleGridCount);

  const selectQuery = (value) => {
    setQuery(value);
    setActiveIndex(0);
    setVisibleGridCount(4);
  };
  const selectVideoIndex = (index) => {
    setActiveIndex(index);
  };

  function getVideoPosition(index) {
    const total = filteredVideos.length;
    const raw = (index - safeActiveIndex + total) % total;
    return raw > Math.floor(total / 2) ? raw - total : raw;
  }

  useEffect(() => {
    if (isPaused || filteredVideos.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % filteredVideos.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, [filteredVideos.length, isPaused]);

  return (
    <section id="video-gallery" className="w-full px-4 pb-20 pt-0 text-[#111827] sm:px-6 lg:px-10">
      <div className="relative mx-auto w-full max-w-[1635px] overflow-visible">

      <div className="relative mx-auto w-full">
        <div className="relative flex min-h-[300px] w-full items-center overflow-hidden border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] px-6 py-12 text-white sm:px-9 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
          <div className="relative flex w-full flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[760px]">
              <span className="inline-flex items-center rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
                Automotive Video Library
              </span>
              <h2 className="mt-6 text-[42px] font-black leading-tight tracking-[-0.04em] sm:text-[52px]">
                JPSPARE <span className="text-[#ff4a50]">Video</span> Gallery
              </h2>
              <p className="mt-4 max-w-[680px] text-[16px] font-medium leading-7 text-white/68">
                Product reviews, customer testimonials, tutorials, and latest updates from JPSPARE specialists.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-white/15 bg-white/8 p-3 backdrop-blur-sm sm:grid-cols-4 lg:ml-auto lg:min-w-[520px]">
              {[
                ["6+", "Video Guides"],
                ["1.3k+", "Total Views"],
                ["3", "Content Types"],
                ["24/7", "Support"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[6px] bg-black/15 px-3 py-3 text-center">
                  <p className="text-[19px] font-black text-[#ff5b61]">{value}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="relative px-6 pt-14 sm:px-9 lg:px-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className="video-coverflow-stage">
            {filteredVideos.map((video, index) => {
              const position = getVideoPosition(index);
              const visible = Math.abs(position) <= 1;

              return (
                <div
                  key={video.code}
                  className={`video-coverflow-card video-coverflow-card-${position} ${position === 0 ? "video-coverflow-card-active" : ""}`}
                  aria-hidden={!visible}
                >
                  <VideoCard
                    video={video}
                    active={position === 0 || filteredVideos.length === 1}
                    onPlay={setSelectedVideo}
                  />
                </div>
              );
            })}
            {!filteredVideos.length ? (
              <div className="rounded-[8px] border border-[#e5eaf1] bg-white px-8 py-10 text-center text-[14px] font-bold text-[#667085]">
                No videos found.
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-4">
          {filteredVideos.map((video, index) => (
            <button
              key={video.code}
              type="button"
              onClick={() => selectVideoIndex(index)}
              className={[
                "video-gallery-dot",
                index === safeActiveIndex
                  ? "video-gallery-dot-active"
                  : "video-gallery-dot-idle",
              ].join(" ")}
              aria-label={`Show video ${index + 1}`}
            />
          ))}
        </div>

        <div className="relative pt-8">
          <div className="mx-auto flex w-full items-center justify-between gap-6 rounded-[8px] border border-[#e5eaf1] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] max-md:flex-col max-md:items-stretch">
            <div className="flex flex-wrap items-center gap-7 text-[13px] font-black uppercase tracking-[0.02em] text-[#111827]">
              {["ALL", "TUTORIAL", "REVIEW", "GUIDE"].map((topic) => {
                const isActive = (!query && topic === "ALL") || query.toLowerCase() === topic.toLowerCase();
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => selectQuery(topic === "ALL" ? "" : topic)}
                    className={`inline-flex h-9 items-center border-b-2 transition ${isActive ? "border-[#111827] text-[#111827]" : "border-transparent text-[#667085] hover:border-[#ef3338] hover:text-[#ef3338]"}`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
            <label className="flex h-9 w-full max-w-[420px] items-center gap-2 rounded-full border border-[#d9dee8] bg-white px-4 text-[#667085] shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:border-[#ef3338] hover:ring-1 hover:ring-[#ef3338] focus-within:border-[#ef3338] focus-within:ring-1 focus-within:ring-[#ef3338] max-md:max-w-none">
              <VideoIcon name="search" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                  setVisibleGridCount(4);
                }}
                placeholder="Search automotive videos..."
                className="h-full w-full bg-transparent text-[12px] font-medium text-[#111827] outline-none placeholder:text-[#98a2b3]"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 pt-8 lg:grid-cols-2">
          {displayedGridVideos.map((video) => (
            <GridVideoCard key={`grid-${video.code}`} video={video} onPlay={setSelectedVideo} />
          ))}
          {!filteredVideos.length ? (
            <div className="rounded-[8px] border border-[#e5eaf1] bg-white px-8 py-10 text-center text-[14px] font-bold text-[#667085] lg:col-span-2">
              No video cards available for this search.
            </div>
          ) : null}
        </div>

        {visibleGridCount < filteredVideos.length ? (
          <div className="flex justify-center pt-8">
            <button
              type="button"
              onClick={() => setVisibleGridCount((current) => Math.min(current + 2, filteredVideos.length))}
              className="inline-flex h-14 min-w-[240px] items-center justify-center gap-3 rounded-[8px] bg-[#ef3338] px-8 text-[16px] font-semibold text-white shadow-[0_18px_35px_rgba(239,51,56,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d91f24] hover:shadow-[0_22px_42px_rgba(239,51,56,0.32)]"
            >
              Load More Videos
              <VideoIcon name="arrow" />
            </button>
          </div>
        ) : null}
      </div>
      </div>
      <style>{`
        .video-coverflow-stage {
          position: relative;
          min-height: 414px;
          overflow: visible;
        }

        .video-coverflow-card {
          --video-x: 0%;
          --video-scale: 0.82;
          --video-opacity: 0;
          --video-z: 1;
          position: absolute;
          left: 50%;
          top: 48%;
          z-index: var(--video-z);
          opacity: var(--video-opacity);
          pointer-events: none;
          transform: translate(-50%, -50%) translateX(var(--video-x)) scale(var(--video-scale));
          transition:
            transform 300ms cubic-bezier(0.2, 0.9, 0.24, 1),
            opacity 240ms cubic-bezier(0.2, 0.9, 0.24, 1),
            filter 240ms cubic-bezier(0.2, 0.9, 0.24, 1);
          will-change: transform, opacity, filter;
        }

        .video-gallery-dot {
          position: relative;
          height: 12px;
          width: 12px;
          overflow: hidden;
          border-radius: 999px;
          background: #5b6675;
          transition:
            width 280ms cubic-bezier(0.2, 0.9, 0.24, 1),
            background 220ms ease,
            transform 220ms ease;
        }

        .video-gallery-dot::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: radial-gradient(circle at 30% 45%, rgba(255,255,255,0.85), rgba(255,255,255,0) 28%),
            linear-gradient(90deg, #ff3f45, #ff6c72);
          opacity: 0;
          transform: translateX(-60%) scaleX(0.45);
        }

        .video-gallery-dot-idle:hover {
          background: #ff8c8f;
          transform: scale(1.08);
        }

        .video-gallery-dot-active {
          width: 48px;
          background: #ff5a61;
          box-shadow: 0 0 18px rgba(255,90,97,0.58);
          animation: videoDotPulse 360ms cubic-bezier(0.2, 0.9, 0.24, 1);
        }

        .video-gallery-dot-active::after {
          opacity: 1;
          animation: videoDotLiquid 420ms cubic-bezier(0.2, 0.9, 0.24, 1) both;
        }

        @keyframes videoDotLiquid {
          0% {
            transform: translateX(-70%) scaleX(0.35);
          }
          58% {
            transform: translateX(8%) scaleX(1.18);
          }
          100% {
            transform: translateX(0) scaleX(1);
          }
        }

        @keyframes videoDotPulse {
          0% {
            transform: scaleX(0.72);
          }
          65% {
            transform: scaleX(1.08);
          }
          100% {
            transform: scaleX(1);
          }
        }

        .video-coverflow-card--1 {
          --video-x: -92%;
          --video-scale: 0.93;
          --video-opacity: 0.82;
          --video-z: 3;
          pointer-events: auto;
          filter: saturate(0.82);
        }

        .video-coverflow-card-0 {
          --video-x: 0%;
          --video-scale: 1;
          --video-opacity: 1;
          --video-z: 7;
          pointer-events: auto;
          filter: saturate(1);
        }

        .video-coverflow-card-1 {
          --video-x: 92%;
          --video-scale: 0.93;
          --video-opacity: 0.82;
          --video-z: 3;
          pointer-events: auto;
          filter: saturate(0.82);
        }

        .video-coverflow-card-active {
          z-index: 9;
        }

        @media (max-width: 1023px) {
          .video-coverflow-stage {
            display: flex;
            min-height: auto;
            gap: 20px;
            overflow-x: auto;
            padding-bottom: 8px;
            scroll-snap-type: x mandatory;
          }

          .video-coverflow-card {
            position: static;
            opacity: 1;
            pointer-events: auto;
            transform: none;
            filter: none;
            scroll-snap-align: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .video-coverflow-card,
          .video-gallery-dot,
          .video-gallery-dot::after {
            transition: none;
            animation: none;
          }
        }
      `}</style>

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
