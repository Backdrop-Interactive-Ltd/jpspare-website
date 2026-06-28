"use client";

import { useEffect, useMemo, useState } from "react";

const eventName = "jpspare-blog-engagement";

function Icon({ name, className = "size-4" }) {
  const paths = {
    download: "M12 3v12m0 0 5-5m-5 5-5-5M5 21h14",
    heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
    thumbs: "M7 10v11H3V10h4Zm4 11h6.5a2 2 0 0 0 2-1.7l1-6A2 2 0 0 0 18.5 11H15l.8-4.2A2.5 2.5 0 0 0 13.4 4L10 11v10h1Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function storageKey(slug) {
  return `jpspare:blog-engagement:${slug}`;
}

function getInitialState(initialSaves, initialLikes, initialDownloads) {
  return {
    saved: false,
    liked: false,
    saves: initialSaves,
    likes: initialLikes,
    downloads: initialDownloads,
  };
}

export function updateArticleEngagement(slug, updater) {
  const fallback = getInitialState(0, 0, 0);
  let current = fallback;

  try {
    current = { ...fallback, ...JSON.parse(window.localStorage.getItem(storageKey(slug)) || "{}") };
  } catch {
    current = fallback;
  }

  const nextEngagement = updater(current);

  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(nextEngagement));
  } catch {
    // The visual state should still update if storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: { slug, engagement: nextEngagement } }));

  return nextEngagement;
}

function useArticleEngagement({ slug, initialSaves = 0, initialLikes = 0, initialDownloads = 0 }) {
  const initialState = useMemo(() => getInitialState(initialSaves, initialLikes, initialDownloads), [initialSaves, initialLikes, initialDownloads]);
  const [engagement, setEngagement] = useState(initialState);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(slug));
      if (saved) setEngagement({ ...initialState, ...JSON.parse(saved) });
    } catch {
      setEngagement(initialState);
    }
  }, [initialState, slug]);

  useEffect(() => {
    function syncEngagement(event) {
      if (event.detail?.slug === slug) {
        setEngagement(event.detail.engagement);
      }
    }

    window.addEventListener(eventName, syncEngagement);
    return () => window.removeEventListener(eventName, syncEngagement);
  }, [slug]);

  function updateEngagement(nextEngagement) {
    setEngagement(nextEngagement);
    updateArticleEngagement(slug, () => nextEngagement);
  }

  function toggleSave() {
    updateEngagement({
      ...engagement,
      saved: !engagement.saved,
      saves: engagement.saved ? Math.max(initialSaves, engagement.saves - 1) : engagement.saves + 1,
    });
  }

  function toggleLike() {
    updateEngagement({
      ...engagement,
      liked: !engagement.liked,
      likes: engagement.liked ? Math.max(initialLikes, engagement.likes - 1) : engagement.likes + 1,
    });
  }

  return { engagement, toggleSave, toggleLike };
}

export function ArticleEngagementSummary(props) {
  const { engagement } = useArticleEngagement(props);

  return (
    <span className="ml-auto inline-flex flex-wrap items-center gap-4 max-lg:ml-0">
      <span className="inline-flex items-center gap-2">
        <Icon name="heart" className="size-4 text-[#ef3338]" />
        {engagement.saves} saves
      </span>
      <span className="inline-flex items-center gap-2">
        <Icon name="thumbs" className="size-4 text-[#3b82f6]" />
        {engagement.likes} likes
      </span>
      <span className="inline-flex items-center gap-2">
        <Icon name="download" className="size-4 text-[#22c55e]" />
        {engagement.downloads} downloads
      </span>
    </span>
  );
}

export function ArticleEngagementActions(props) {
  const { engagement, toggleSave, toggleLike } = useArticleEngagement(props);

  return (
    <>
      <button
        type="button"
        aria-pressed={engagement.saved}
        onClick={toggleSave}
        className={`inline-flex h-12 items-center gap-2 rounded-[8px] px-6 text-[15px] font-black text-white shadow-[0_14px_26px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(239,51,56,0.28)] ${engagement.saved ? "bg-[#dc2626]" : "bg-[#ef3338]"}`}
      >
        <Icon name="heart" />
        {engagement.saves}
      </button>
      <button
        type="button"
        aria-pressed={engagement.liked}
        onClick={toggleLike}
        className={`inline-flex h-12 items-center gap-2 rounded-[8px] px-6 text-[15px] font-black text-white shadow-[0_14px_26px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(37,99,235,0.24)] ${engagement.liked ? "bg-[#1d4ed8]" : "bg-[#2563eb]"}`}
      >
        <Icon name="thumbs" />
        {engagement.likes}
      </button>
    </>
  );
}
