"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import TopDealBar from "../TopDealBar";
import { Header } from "../page";

const articles = [
  {
    title: "When Was the Last Time Your Tires Were Rotated and Balanced?",
    category: "General",
    date: "09/02/2025",
    read: "2 min read",
    author: "JPSPARE Experts",
    excerpt: "Tires are a critical safety component of your vehicle, and their condition directly impacts performance, handling, and fuel efficiency.",
    image: "/product-detail-reference.jpg",
    position: "42% 20%",
    tag: "Maintenance",
  },
  {
    title: "10 Road Safety Tips for Driving Your Car in the Rain",
    category: "General",
    date: "06/26/2025",
    read: "3 min read",
    author: "JPSPARE Experts",
    excerpt: "Driving during the rainy season can be stressful. Wet roads, poor visibility, and unexpected traffic require extra care.",
    image: "/black-odor-red-console.jpg",
    position: "center",
    tag: "Safety",
  },
  {
    title: "Changing Engine Oil",
    category: "General",
    date: "10/27/2022",
    read: "4 min read",
    author: "Routine Systems",
    excerpt: "Changing your vehicle's engine oil is not difficult, but it must be done properly. Learn the correct steps and intervals.",
    image: "/japanparts-reference.png",
    position: "66% 45%",
    tag: "Maintenance",
  },
  {
    title: "Replacing Brake Pads",
    category: "General",
    date: "10/27/2022",
    read: "5 min read",
    author: "Routine Systems",
    excerpt: "Replacing brake pads is not hard, but it is one job that must be done carefully. Know the warning signs before you replace.",
    image: "/accessory-wide-angle-holder.jpeg",
    position: "center",
    tag: "Brake Parts",
  },
  {
    title: "How to change oil filter",
    category: "General",
    date: "04/12/2023",
    read: "6 min read",
    author: "Routine Systems",
    excerpt: "Changing the fuel filter is part of regular maintenance. Keeping your fuel system properly maintained helps engine life.",
    image: "/accessory-car-shampoo.jpeg",
    position: "center",
    tag: "Engine Parts",
  },
  {
    title: "How to Change Battery",
    category: "General",
    date: "01/23/2023",
    read: "6 min read",
    author: "Routine Systems",
    excerpt: "Changing battery is not difficult, but it is one job that must be done safely. Learn the steps before replacing it.",
    image: "/accessory-yesido-wireless-holder.jpeg",
    position: "center",
    tag: "Troubleshooting",
  },
];

const topics = [
  ["Maintenance Tips", "Regular maintenance schedules, DIY guides, and professional recommendations for keeping your vehicle in top condition.", "Read Articles", "green", "tool"],
  ["Expert Reviews", "In-depth product reviews, comparisons, and recommendations from our automotive parts specialists.", "Read Reviews", "red", "user"],
  ["Technical Guides", "Detailed installation guides, troubleshooting tips, and technical specifications for Japanese automotive parts.", "View Guides", "blue", "book"],
];

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

function TopicBadge({ children, active = false, ...props }) {
  return (
    <button {...props} className={`rounded-full px-4 py-2 text-[12px] font-black transition ${active ? "bg-[#ef3338] text-white" : "bg-[#f4f5f7] text-[#4b5563] hover:bg-[#ffecec] hover:text-[#ef3338]"}`}>
      {children}
    </button>
  );
}

function FeaturedSmallCard({ article }) {
  return (
    <article className="overflow-hidden rounded-[10px] bg-white text-left shadow-[0_12px_28px_rgba(15,23,42,0.09)] ring-1 ring-[#edf0f3] transition hover:-translate-y-1 hover:ring-[#ffbcbc]">
      <div className="relative h-[190px] bg-cover bg-center" style={{ backgroundImage: `url(${article.image})`, backgroundPosition: article.position }}>
        <span className="absolute left-4 top-4 rounded-full bg-[#ef3338] px-3 py-1 text-[10px] font-black uppercase text-black">{article.category}</span>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-[16px] font-black leading-6 text-[#111827]">{article.title}</h3>
        <p className="mt-3 line-clamp-3 text-[13px] font-medium leading-6 text-[#6b7280]">{article.excerpt}</p>
        <Link href="#latest-articles" className="mt-4 inline-flex items-center gap-2 text-[12px] font-black text-[#ef3338]">
          Read Full Article <Icon name="arrow" className="size-3" />
        </Link>
      </div>
    </article>
  );
}

export default function BlogPageClient() {
  const [query, setQuery] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [subscribed, setSubscribed] = useState(false);

  const filteredArticles = useMemo(() => {
    const term = query.trim().toLowerCase();
    return articles.filter((article, index) => {
      const matchesQuery = !term || `${article.title} ${article.excerpt} ${article.tag}`.toLowerCase().includes(term);
      const matchesFeatured = !featuredOnly || index < 4;
      return matchesQuery && matchesFeatured;
    });
  }, [query, featuredOnly]);

  const latestArticles = filteredArticles.slice(0, visibleCount);
  const heroArticle = articles[0];

  return (
    <>
      <TopDealBar />
      <Header />
      <main className="bg-white text-[#111827]">
        <section className="relative overflow-hidden bg-[#111827] px-4 py-24 text-center text-white sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,48px_48px,48px_48px]" />
          <div className="relative mx-auto max-w-[900px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f7d95f]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#f7d95f]">
              <Icon name="book" className="size-3.5" />
              Automotive Knowledge Center
            </span>
            <h1 className="mt-7 text-[52px] font-black leading-tight tracking-[-0.05em] max-md:text-[42px] max-sm:text-[34px]">
              Expert <span className="text-[#ef3338]">Automotive</span><br />Insights
            </h1>
            <p className="mx-auto mt-5 max-w-[680px] text-[17px] font-medium leading-8 text-white/72">
              Professional maintenance tips, technical guides, and industry insights from Japan&apos;s leading automotive specialists.
            </p>
            <div className="mx-auto mt-10 grid max-w-[560px] grid-cols-4 gap-8 max-sm:grid-cols-2 max-sm:gap-5">
              {[
                ["13+", "Expert Articles"],
                ["50k+", "Monthly Readers"],
                ["15+", "Years Experience"],
                ["24/7", "Expert Support"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-[20px] font-black text-[#ef3338]">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-10 w-full max-w-[760px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[9px] border border-[#edf0f3] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
            <label className="flex h-12 items-center gap-3 rounded-[7px] border border-[#dfe5ec] px-4">
              <Icon name="search" className="size-4 text-[#9ca3af]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search automotive articles..." className="h-full min-w-0 flex-1 text-[14px] font-medium outline-none placeholder:text-[#9ca3af]" />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <TopicBadge active={!featuredOnly} onClick={() => setFeaturedOnly(false)}>All Articles</TopicBadge>
              <button onClick={() => setFeaturedOnly(true)} className={`rounded-full px-4 py-2 text-[12px] font-black transition ${featuredOnly ? "bg-[#ef3338] text-white" : "bg-[#f4f5f7] text-[#4b5563] hover:bg-[#ffecec] hover:text-[#ef3338]"}`}>Featured</button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#6b7280]">
              <span>Popular Topics:</span>
              {["Maintenance", "Engine Parts", "Installation", "Troubleshooting"].map((topic, index) => (
                <button key={topic} onClick={() => setQuery(topic)} className={`rounded-full px-3 py-1.5 ${["bg-blue-50 text-blue-600", "bg-emerald-50 text-emerald-600", "bg-rose-50 text-rose-600", "bg-amber-50 text-amber-600"][index]}`}>
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1040px] px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-[28px] font-black tracking-[-0.03em]">Featured Articles</h2>
          <p className="mt-2 text-[14px] font-medium text-[#6b7280]">Hand-picked automotive insights and expert recommendations</p>

          <article className="group relative mt-10 overflow-hidden rounded-[14px] bg-[#111827] text-left shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
            <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]" style={{ backgroundImage: `url(${heroArticle.image})`, backgroundPosition: heroArticle.position }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/15" />
            <div className="relative z-10 min-h-[360px] max-w-[760px] p-10 text-white max-sm:p-6">
              <span className="rounded-full bg-[#ef3338] px-3 py-1.5 text-[10px] font-black uppercase text-black">Featured</span>
              <span className="ml-2 rounded-full bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase text-white">General</span>
              <h3 className="mt-8 text-[36px] font-black leading-tight tracking-[-0.04em] max-sm:text-[26px]">{heroArticle.title}</h3>
              <p className="mt-4 max-w-[680px] text-[15px] font-medium leading-7 text-white/72">{heroArticle.excerpt}</p>
              <div className="mt-5"><MetaRow article={heroArticle} light /></div>
              <Link href="#latest-articles" className="mt-8 inline-flex h-11 items-center gap-3 rounded-[6px] bg-[#ef3338] px-6 text-[13px] font-black text-white transition hover:bg-[#d3191d]">
                Read Full Story <Icon name="arrow" className="size-4" />
              </Link>
            </div>
          </article>

          <div className="mt-8 grid grid-cols-3 gap-6 max-lg:grid-cols-1">
            {articles.slice(1, 4).map((article) => (
              <FeaturedSmallCard key={article.title} article={article} />
            ))}
          </div>
        </section>

        <section id="latest-articles" className="mx-auto w-full max-w-[1040px] px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-[28px] font-black tracking-[-0.03em]">Latest Articles</h2>
          <p className="mt-2 text-[14px] font-medium text-[#6b7280]">Stay updated with the latest automotive news and technical insights</p>
          <div className="mt-10 space-y-6">
            {latestArticles.map((article) => (
              <article key={article.title} className="grid grid-cols-[280px_1fr] overflow-hidden rounded-[10px] bg-white text-left shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-[#edf0f3] transition hover:-translate-y-1 hover:ring-[#ffbcbc] max-md:grid-cols-1">
                <div className="relative min-h-[190px] bg-cover bg-center" style={{ backgroundImage: `url(${article.image})`, backgroundPosition: article.position }}>
                  <span className="absolute left-4 top-4 rounded-full bg-[#ef3338] px-3 py-1 text-[10px] font-black uppercase text-black">{article.category}</span>
                </div>
                <div className="p-6">
                  <MetaRow article={article} />
                  <h3 className="mt-4 text-[19px] font-black leading-6 text-[#111827]">{article.title}</h3>
                  <p className="mt-3 line-clamp-2 text-[14px] font-medium leading-6 text-[#6b7280]">{article.excerpt}</p>
                  <Link href="#latest-articles" className="mt-5 inline-flex items-center gap-2 text-[12px] font-black text-[#ef3338]">
                    Continue Reading <Icon name="arrow" className="size-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {visibleCount < filteredArticles.length && (
            <button onClick={() => setVisibleCount((value) => value + 3)} className="mt-10 inline-flex h-12 items-center justify-center gap-3 rounded-[7px] bg-[#ef3338] px-7 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(220,38,38,0.2)] transition hover:bg-[#d3191d]">
              Load More Articles <Icon name="arrow" className="size-4" />
            </button>
          )}
        </section>

        <section className="mx-auto w-full max-w-[1040px] px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-[28px] font-black tracking-[-0.03em]">Explore Topics</h2>
          <p className="mt-2 text-[14px] font-medium text-[#6b7280]">Discover expert insights across different automotive categories</p>
          <div className="mt-10 grid grid-cols-3 gap-8 max-lg:grid-cols-1">
            {topics.map(([title, body, cta, tone, icon]) => (
              <article key={title} className="relative rounded-[10px] border border-[#edf0f3] bg-white p-8 text-left shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#f7d95f]">
                <span className={`inline-flex size-12 items-center justify-center rounded-[8px] ${tone === "green" ? "bg-emerald-500" : tone === "blue" ? "bg-blue-500" : "bg-[#ef3338]"} text-white`}>
                  <Icon name={icon} className="size-6" />
                </span>
                <h3 className="mt-6 text-[18px] font-black">{title}</h3>
                <p className="mt-4 text-[13px] font-medium leading-6 text-[#6b7280]">{body}</p>
                <button onClick={() => setQuery(title.split(" ")[0])} className={`mt-6 inline-flex items-center gap-2 text-[13px] font-black ${tone === "green" ? "text-emerald-600" : tone === "blue" ? "text-blue-600" : "text-[#ef3338]"}`}>
                  {cta} <Icon name="arrow" className="size-3.5" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1040px] px-4 pb-24 pt-10 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[14px] bg-[#05070b] p-12 text-center text-white shadow-[0_18px_42px_rgba(15,23,42,0.15)] max-sm:p-7">
            <div className="absolute -left-12 -top-12 size-40 rounded-full bg-[#ef3338]/20" />
            <div className="absolute -bottom-16 -right-16 size-52 rounded-full bg-[#ef3338]/20" />
            <div className="relative">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-[9px] bg-[#ef3338]">
                <Icon name="book" className="size-6" />
              </span>
              <h2 className="mt-6 text-[28px] font-black">Stay Ahead of the Curve</h2>
              <p className="mx-auto mt-3 max-w-[650px] text-[14px] font-medium leading-7 text-white/65">Get exclusive automotive insights, maintenance tips, product reviews, and technical guides delivered to your inbox.</p>
              <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }} className="mx-auto mt-8 flex max-w-[470px] gap-3 max-sm:flex-col">
                <input type="email" required placeholder="Enter your email address" className="h-12 min-w-0 flex-1 rounded-[6px] bg-[#111827] px-4 text-[14px] font-medium text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-[#ef3338]" />
                <button className="h-12 rounded-[6px] bg-[#ef3338] px-7 text-[13px] font-black text-white transition hover:bg-[#d3191d]">Subscribe</button>
              </form>
              {subscribed && <p className="mt-4 text-[13px] font-bold text-emerald-300">Demo subscription saved.</p>}
              <div className="mt-5 flex flex-wrap justify-center gap-5 text-[11px] font-bold text-white/45">
                <span>Weekly updates</span>
                <span>Expert tips</span>
                <span>Exclusive content</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
