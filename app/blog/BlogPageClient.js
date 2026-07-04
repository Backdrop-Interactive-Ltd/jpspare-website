"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Header } from "../homepage/site-header";
import { articles as staticArticles } from "./articles";

const INITIAL_ARTICLE_CARDS = 12;
const MAX_ARTICLE_CARDS = 24;
const LOAD_MORE_ARTICLE_COUNT = 4;

const exploreTopics = [
  {
    title: "Maintenance Tips",
    description: "Car care guides, service schedules, and maintenance recommendations for everyday drivers.",
    cta: "Read Tips",
    href: "/articles?category=maintenance",
    icon: "calendar",
    terms: ["maintenance", "tires", "oil", "battery", "brake"],
    fallbackCount: 12,
    accent: "text-[#16a34a]",
    badge: "bg-[#22c55e]",
    border: "hover:border-[#bbf7d0]",
    shadow: "hover:shadow-[0_24px_54px_rgba(34,197,94,0.14)]",
  },
  {
    title: "Parts Buying Guides",
    description: "Expert advice to help customers choose the right genuine parts and accessories.",
    cta: "View Guides",
    href: "/articles?category=buying-guides",
    icon: "bag",
    terms: ["parts", "accessories", "engine", "filter", "brake"],
    fallbackCount: 8,
    accent: "text-[#ef3338]",
    badge: "bg-[#ef3338]",
    border: "hover:border-[#fecaca]",
    shadow: "hover:shadow-[0_24px_54px_rgba(239,51,56,0.14)]",
  },
  {
    title: "Installation Guides",
    description: "Step-by-step tutorials, DIY instructions, and troubleshooting resources.",
    cta: "Learn More",
    href: "/articles?category=installation",
    icon: "tool",
    terms: ["installation", "diy", "troubleshooting", "change", "replacing"],
    fallbackCount: 9,
    accent: "text-[#2563eb]",
    badge: "bg-[#3b82f6]",
    border: "hover:border-[#bfdbfe]",
    shadow: "hover:shadow-[0_24px_54px_rgba(59,130,246,0.14)]",
  },
  {
    title: "Automotive News",
    description: "Industry updates, new arrivals, trends, and important automotive developments.",
    cta: "Read News",
    href: "/articles?category=news",
    icon: "newspaper",
    terms: ["news", "updates", "new arrivals", "trends", "safety"],
    fallbackCount: 6,
    accent: "text-[#ca8a04]",
    badge: "bg-[#f59e0b]",
    border: "hover:border-[#fde68a]",
    shadow: "hover:shadow-[0_24px_54px_rgba(245,158,11,0.14)]",
  },
];

function getTopicArticleCount(topic, articles) {
  const count = articles.filter((article) => {
    const haystack = `${article.title} ${article.excerpt} ${article.tag} ${article.category}`.toLowerCase();
    return topic.terms.some((term) => haystack.includes(term));
  }).length;

  // TODO: Replace fallbackCount with CMS/API-backed category totals once article categories are stored server-side.
  return count || topic.fallbackCount;
}

function Icon({ name, className = "size-4" }) {
  const paths = {
    search: "M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
    calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
    clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    user: "M20 21a8 8 0 0 0-16 0m8-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z",
    tool: "m14.7 6.3 3-3a3 3 0 0 1-4 4l-8.4 8.4a2 2 0 1 0 3 3l8.4-8.4a3 3 0 0 1 4-4l-3 3-3-3Z",
    sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
    bag: "M6 7h12l1 14H5L6 7Zm3 0a3 3 0 0 1 6 0",
    star: "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1-4.4-4.3 6.1-.9L12 3Z",
    newspaper: "M4 19h16V5H4v14Zm4-10h8M8 13h8M8 17h5M4 7H2v12a2 2 0 0 0 2 2h16",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function MetaRow({ article, light = false }) {
  const color = light ? "text-white/75" : "text-[#6b7280]";
  return (
    <div className={`flex flex-wrap items-center gap-4 text-[12px] font-semibold ${color}`}>
      <span className="inline-flex items-center gap-1.5"><Icon name="calendar" className="size-3.5 text-[#ef3338]" />{article.date}</span>
      <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="size-3.5 text-[#ef3338]" />{article.read}</span>
      <span className="inline-flex items-center gap-1.5"><Icon name="user" className="size-3.5 text-[#ef3338]" />{article.author}</span>
    </div>
  );
}

function EditorialSpotlightBanner({ article }) {
  return (
    <article className="mx-auto w-full max-w-[1635px] px-0 pt-0">
      <Link
        href={`/blog/${article.slug}`}
        className="block rounded-[8px]"
      >
        <div className="group/image relative min-h-[460px] overflow-hidden rounded-[8px] border border-white bg-[#111827] shadow-[0_28px_70px_rgba(15,23,42,0.18)] max-md:min-h-[340px]">
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover/image:scale-[1.04]"
            style={{ backgroundImage: `url(${article.image})`, backgroundPosition: article.position }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/5 to-black/70" />
          <div className="absolute left-10 top-10 z-10 flex items-center gap-2 max-sm:left-5 max-sm:top-5">
            <span className="rounded-[5px] bg-[#ef3338] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.02em] text-white shadow-[0_10px_22px_rgba(239,51,56,0.26)]">
              Featured
            </span>
            <span className="rounded-[5px] border border-white/12 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.02em] text-white/90 backdrop-blur-sm">
              General
            </span>
          </div>
          <div className="absolute inset-x-5 bottom-5 rounded-[14px] border border-white/15 bg-black/35 p-5 text-white shadow-[0_18px_38px_rgba(0,0,0,0.24)] backdrop-blur-md max-sm:inset-x-3 max-sm:bottom-3 max-sm:p-4">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h3 className="mt-2 max-w-[720px] text-[24px] font-black leading-tight tracking-[-0.03em] max-sm:text-[20px]">
                  {article.title}
                </h3>
                <p className="mt-2 max-w-[760px] text-[13px] font-medium leading-6 text-white/72">{article.excerpt}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5">
                <span className="group/cta inline-flex h-11 shrink-0 items-center justify-center gap-3 rounded-[6px] bg-[#ef3338] px-6 text-[14px] font-bold text-white shadow-[0_14px_28px_rgba(239,51,56,0.24)] transition duration-300 hover:scale-[1.04] hover:bg-[#ef3338]">
                  Read Full Story
                  <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                </span>
                <div className="flex flex-wrap items-center gap-5 text-[12px] font-black text-white/82">
                  <span className="inline-flex items-center gap-2">
                    <Icon name="calendar" className="size-3.5 text-[#ef3338]" />
                    {article.date}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Icon name="clock" className="size-3.5 text-[#ef3338]" />
                    {article.read}
                  </span>
                  <span className="inline-flex items-center gap-2 text-left leading-none">
                    <Icon name="user" className="size-3.5 text-[#ef3338]" />
                    <span className="text-[12px] font-black text-white">{article.author}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[article.tag, "Technical Guide", article.category].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ExploreTopicsSection({ articles }) {
  return (
    <section className="w-full px-4 pb-10 pt-2 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1635px]">
        <div className="mb-7 text-center">
          <h2 className="text-[30px] font-black tracking-[-0.04em] text-[#111827] max-sm:text-[24px]">Explore Topics</h2>
          <p className="mx-auto mt-3 max-w-[620px] text-[15px] font-medium leading-6 text-[#667085]">
            Discover expert insights across different automotive categories
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {exploreTopics.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className={`group relative flex min-h-[340px] flex-col overflow-hidden rounded-[8px] border-2 border-transparent bg-white p-8 text-left shadow-[0_18px_42px_rgba(15,23,42,0.04)] outline-none transition duration-300 hover:-translate-y-1 ${topic.border} ${topic.shadow} focus-visible:ring-2 focus-visible:ring-[#ef3338] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f8] max-sm:min-h-[300px]`}
            >
              <span className={`absolute right-7 top-7 grid size-8 place-items-center rounded-full ${topic.badge} text-[11px] font-black text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition duration-300 group-hover:scale-110`}>
                {getTopicArticleCount(topic, articles)}
              </span>
              <span className={`inline-flex size-16 items-center justify-center rounded-[14px] ${topic.badge} text-white shadow-[0_16px_32px_rgba(15,23,42,0.08)] transition duration-300 group-hover:scale-[1.04]`}>
                <Icon name={topic.icon} className="size-8" />
              </span>
              <h3 className="mt-8 text-[24px] font-black leading-tight tracking-[-0.03em] text-[#111827] max-xl:text-[21px]">{topic.title}</h3>
              <p className="mt-5 line-clamp-4 text-[16px] font-medium leading-7 text-[#4b5563] max-xl:text-[15px]">{topic.description}</p>
              <span className={`mt-auto inline-flex items-center gap-3 pt-8 text-[16px] font-black ${topic.accent} transition`}>
                {topic.cta} <Icon name="arrow" className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function BlogPageClient({ initialArticles }) {
  const articles = Array.isArray(initialArticles) && initialArticles.length ? initialArticles : staticArticles;
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ARTICLE_CARDS);

  const filteredArticles = useMemo(() => {
    const term = query.trim().toLowerCase();
    return articles.filter((article) => !term || `${article.title} ${article.excerpt} ${article.tag}`.toLowerCase().includes(term));
  }, [query]);

  const latestArticles = useMemo(() => {
    if (!filteredArticles.length) return [];

    return Array.from({ length: visibleCount }, (_, index) => {
      const article = filteredArticles[index % filteredArticles.length];
      return { ...article, displayKey: `${article.title}-${index}` };
    });
  }, [filteredArticles, visibleCount]);
  const heroArticle = articles[0];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f4f6f8] pb-20 text-[#111827]">
        <section className="w-full px-4 pb-8 pt-0 sm:px-6 lg:px-10">
          <div className="relative mx-auto flex min-h-[300px] w-full max-w-[1635px] items-center overflow-hidden border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] px-6 py-12 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)] sm:px-9 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
          <div className="relative flex w-full flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[710px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
              <Icon name="book" className="size-3.5" />
              Automotive Knowledge Center
            </span>
            <h1 className="mt-6 text-[42px] font-black leading-tight tracking-[-0.04em] sm:text-[52px]">
              Expert <span className="text-[#ff4a50]">Automotive</span> Insights
            </h1>
            <p className="mt-4 max-w-[680px] text-[16px] font-medium leading-7 text-white/68">
              Professional maintenance tips, technical guides, and industry insights from Japan&apos;s leading automotive specialists.
            </p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-white/15 bg-white/8 p-3 backdrop-blur-sm sm:grid-cols-4 lg:ml-auto lg:min-w-[450px]">
              {[
                ["13+", "Expert Articles"],
                ["50k+", "Monthly Readers"],
                ["15+", "Years Experience"],
                ["24/7", "Expert Support"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[6px] bg-black/15 px-3 py-3 text-center">
                  <p className="text-[19px] font-black text-[#ff5b61]">{value}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </div>
          </div>
        </section>

        <section className="w-full px-4 pb-3 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1635px] items-center justify-between gap-6 rounded-[8px] border border-[#e5eaf1] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] max-md:flex-col max-md:items-stretch">
            <div className="flex flex-wrap items-center gap-7 text-[13px] font-black uppercase tracking-[0.02em] text-[#111827]">
              <button type="button" onClick={() => setQuery("")} className={`inline-flex h-9 items-center border-b-2 transition ${!query ? "border-[#111827] text-[#111827]" : "border-transparent text-[#667085] hover:border-[#ef3338] hover:text-[#ef3338]"}`}>
                ALL
              </button>
              {["MAINTENANCE", "ENGINE PARTS", "INSTALLATION", "TROUBLESHOOTING"].map((topic) => (
                <button key={topic} type="button" onClick={() => setQuery(topic)} className={`inline-flex h-9 items-center border-b-2 transition ${query === topic ? "border-[#111827] text-[#111827]" : "border-transparent text-[#667085] hover:border-[#ef3338] hover:text-[#ef3338]"}`}>
                  {topic}
                </button>
              ))}
            </div>
            <label className="flex h-9 w-full max-w-[420px] items-center gap-2 rounded-full border border-[#d9dee8] bg-white px-4 text-[#667085] shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:border-[#ef3338] hover:ring-1 hover:ring-[#ef3338] focus-within:border-[#ef3338] focus-within:ring-1 focus-within:ring-[#ef3338] max-md:max-w-none">
              <Icon name="search" className="size-3.5 text-[#667085]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search automotive articles..."
                className="h-full w-full bg-transparent text-[12px] font-medium text-[#111827] outline-none placeholder:text-[#98a2b3]"
              />
            </label>
          </div>
        </section>

        <section className="w-full px-4 pb-0 pt-1 sm:px-6 lg:px-10">
          <EditorialSpotlightBanner article={heroArticle} />
        </section>

        <section id="latest-articles" className="w-full px-4 pb-10 pt-5 sm:px-6 lg:px-10">
          <div className="mx-auto grid w-full max-w-[1635px] grid-cols-2 gap-5 xl:gap-6 max-lg:grid-cols-1">
            {latestArticles.map((article) => (
              <article key={article.displayKey} className="group grid min-h-[244px] grid-cols-[minmax(230px,260px)_1fr] overflow-hidden rounded-[8px] border border-[#e5eaf1] bg-white text-left shadow-[0_14px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#f2c7c9] hover:shadow-[0_22px_46px_rgba(239,51,56,0.12)] max-xl:grid-cols-[220px_1fr] max-md:min-h-0 max-md:grid-cols-1">
                <div className="relative min-h-full overflow-hidden bg-[#111827] max-md:min-h-[220px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.05]"
                    style={{ backgroundImage: `url(${article.image})`, backgroundPosition: article.position }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/10" />
                  <span className="absolute left-4 top-4 rounded-[6px] bg-[#ef3338] px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-[0_10px_22px_rgba(239,51,56,0.25)]">{article.category}</span>
                </div>
                <div className="flex min-w-0 flex-col p-6 lg:p-7">
                  <MetaRow article={article} />
                  <h3 className="mt-4 line-clamp-2 text-[20px] font-black leading-[1.25] text-[#111827] max-sm:text-[18px]">{article.title}</h3>
                  <p className="mt-3 line-clamp-2 text-[14px] font-medium leading-6 text-[#6b7280]">{article.excerpt}</p>
                  <Link href={`/blog/${article.slug}`} className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-[12px] font-black text-[#111827] transition group-hover:text-[#ef3338]">
                    Continue Reading <Icon name="arrow" className="size-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {!!filteredArticles.length && visibleCount < MAX_ARTICLE_CARDS && (
            <button
              type="button"
              onClick={() => setVisibleCount((value) => Math.min(value + LOAD_MORE_ARTICLE_COUNT, MAX_ARTICLE_CARDS))}
              className="group/button mx-auto mt-10 flex h-[56px] min-w-[240px] items-center justify-center gap-3 rounded-[8px] bg-[#ef3338] px-9 text-[15px] font-black text-white shadow-[0_14px_30px_rgba(239,51,56,0.24)] transition duration-300 hover:scale-[1.04] hover:bg-[#ef3338] max-sm:w-full"
            >
              Load More Articles <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            </button>
          )}
        </section>

        <ExploreTopicsSection articles={articles} />
      </main>
    </>
  );
}
