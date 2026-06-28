"use client";

import { useMemo, useState } from "react";
import { updateArticleEngagement } from "./ArticleEngagement";

function Icon({ name, className = "size-4" }) {
  const paths = {
    copy: "M8 8h11v11H8V8ZM5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1",
    download: "M12 3v12m0 0 5-5m-5 5-5-5M5 21h14",
    share: "M18 8a3 3 0 1 0-2.8-4M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM8.6 9.4l6.8 3.2M8.6 16.6l6.8-3.2",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export default function ArticleUtilityActions({ article }) {
  const [copied, setCopied] = useState(false);

  const articleUrl = useMemo(() => {
    if (typeof window === "undefined") return `/blog/${article.slug}`;
    return `${window.location.origin}/blog/${article.slug}`;
  }, [article.slug]);

  function downloadArticle() {
    const content = [
      article.title,
      "",
      article.summary || article.excerpt,
      "",
      article.excerpt,
      "",
      ...article.sections.flatMap(([heading, body], index) => [`${index + 1}. ${heading}`, body, ""]),
      `Read online: ${articleUrl}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `${article.slug}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);

    updateArticleEngagement(article.slug, (engagement) => ({
      ...engagement,
      saves: engagement.saves || article.saves || 0,
      likes: engagement.likes || article.likes || 0,
      downloads: (engagement.downloads || article.downloads || 0) + 1,
    }));
  }

  async function copyArticleLink() {
    try {
      await window.navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={downloadArticle}
        className="group inline-flex h-12 items-center gap-2 overflow-hidden rounded-[8px] bg-[#111827] px-6 text-[15px] font-black text-white shadow-[0_14px_26px_rgba(17,24,39,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0b1220] hover:shadow-[0_18px_30px_rgba(17,24,39,0.24)]"
      >
        <Icon name="download" className="size-4 transition duration-300 group-hover:translate-y-0.5" />
        Download Article
      </button>
      <button
        type="button"
        className="inline-flex h-12 items-center gap-2 rounded-[8px] border border-[#d9dee8] bg-white px-6 text-[15px] font-black text-[#111827] shadow-[0_12px_22px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-[#ef3338] hover:text-[#ef3338] hover:shadow-[0_18px_30px_rgba(239,51,56,0.12)]"
      >
        <Icon name="share" />
        Share
      </button>
      <button
        type="button"
        onClick={copyArticleLink}
        aria-label={copied ? "Article link copied" : `Copy link for ${article.title}`}
        title={copied ? "Link Copied" : "Copy Link"}
        className={`inline-grid h-12 w-12 place-items-center rounded-[8px] border text-[#111827] shadow-[0_12px_22px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-[#ef3338] hover:text-[#ef3338] hover:shadow-[0_18px_30px_rgba(239,51,56,0.12)] ${copied ? "border-[#ef3338] bg-[#fff1f2] text-[#ef3338]" : "border-[#d9dee8] bg-white"}`}
      >
        <Icon name="copy" className="size-5" />
      </button>
    </>
  );
}
