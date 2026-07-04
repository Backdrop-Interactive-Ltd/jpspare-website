import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db";
import { Header } from "../../homepage/site-header";
import { articles, getArticleBySlug } from "../articles";
import { ArticleEngagementActions, ArticleEngagementSummary } from "./ArticleEngagement";
import ArticleUtilityActions from "./ArticleUtilityActions";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function estimateReadTime(content) {
  const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(Math.ceil(words / 180), 1)} min read`;
}

function sectionsFromContent(content) {
  const clean = String(content || "").trim();
  if (!clean) return [];

  return clean
    .split(/\n{2,}/)
    .map((paragraph, index) => [`Section ${index + 1}`, paragraph.trim()])
    .filter(([, body]) => body);
}

function mapBlogPostToArticle(post) {
  const category = post.category?.name || "General";
  return {
    title: post.title,
    slug: post.slug,
    category,
    date: formatDate(post.publishedAt || post.createdAt),
    read: estimateReadTime(post.content),
    author: post.authorName || "JPSPARE Experts",
    excerpt: post.excerpt || "",
    image: post.featuredImage || "/jpspare-logo.png",
    position: "center",
    tag: post.tags?.[0] || category,
    views: "New",
    saves: 0,
    likes: 0,
    downloads: 0,
    summary: post.excerpt || "",
    sections: sectionsFromContent(post.content),
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
  };
}

async function getDatabaseArticle(slug) {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { category: { select: { name: true, slug: true } } },
    });
    return post ? mapBlogPostToArticle(post) : null;
  } catch {
    return null;
  }
}

async function getArticle(slug) {
  return (await getDatabaseArticle(slug)) || getArticleBySlug(slug);
}

function Icon({ name, className = "size-4" }) {
  const paths = {
    arrowLeft: "M19 12H5m6-6-6 6 6 6",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
    clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    user: "M20 21a8 8 0 0 0-16 0m8-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z",
    heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
    thumbs: "M7 10v11H3V10h4Zm4 11h6.5a2 2 0 0 0 2-1.7l1-6A2 2 0 0 0 18.5 11H15l.8-4.2A2.5 2.5 0 0 0 13.4 4L10 11v10h1Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found | JPSPARE",
    };
  }

  return {
    title: article.seoTitle || `${article.title} | JPSPARE Blog`,
    description: article.seoDescription || article.excerpt,
  };
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const relatedArticles = articles.filter((item) => item.slug !== article.slug);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f4f6f8] pb-16 text-[#111827]">
        <section className="relative overflow-hidden bg-[#111827] px-4 py-16 text-white sm:px-6 lg:px-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${article.image})`, backgroundPosition: article.position }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,24,39,0.96)_0%,rgba(17,24,39,0.82)_54%,rgba(17,24,39,0.62)_100%)]" />
          <div className="pointer-events-none absolute -right-28 -top-32 size-80 rounded-full bg-[#ef3338]/20" />
          <div className="relative mx-auto w-full max-w-[1635px]">
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-white/70">
              <Link href="/" className="transition hover:text-[#ef3338]">Home</Link>
              <span>/</span>
              <Link href="/blog" className="transition hover:text-[#ef3338]">Blog</Link>
              <span>/</span>
              <span className="text-[#ff7a7e]">{article.title}</span>
            </div>
            <Link href="/blog" className="mt-8 inline-flex items-center gap-2 text-[15px] font-bold text-[#ff7a7e] transition hover:text-white">
              <Icon name="arrowLeft" className="size-4" />
              Back to Blog
            </Link>
            <span className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#ef3338] px-5 py-3 text-[12px] font-black uppercase tracking-[0.04em] text-white">
              <Icon name="book" className="size-4" />
              {article.category}
            </span>
            <h1 className="mt-8 max-w-[960px] text-[54px] font-black leading-[1.1] tracking-[-0.05em] max-lg:text-[42px] max-sm:text-[32px]">
              {article.title}
            </h1>
            <p className="mt-6 max-w-[820px] text-[22px] font-medium leading-9 text-white/82 max-sm:text-[17px] max-sm:leading-7">
              {article.summary || article.excerpt}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6 text-[14px] font-bold text-white/78">
              <span className="inline-flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-[#ef3338] text-white"><Icon name="user" className="size-5" /></span>
                <span><span className="block text-white">{article.author}</span><span className="text-[12px] text-white/55">Automotive Expert</span></span>
              </span>
              <span className="inline-flex items-center gap-2"><Icon name="calendar" className="size-4 text-[#ef3338]" />{article.date}</span>
              <span className="inline-flex items-center gap-2"><Icon name="clock" className="size-4 text-[#ef3338]" />{article.read}</span>
              <span className="inline-flex items-center gap-2"><Icon name="eye" className="size-4 text-[#ef3338]" />{article.views} views</span>
              <ArticleEngagementSummary slug={article.slug} initialSaves={article.saves} initialLikes={article.likes} initialDownloads={article.downloads} />
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-10">
          <div className="mx-auto grid w-full max-w-[1635px] grid-cols-[minmax(0,1fr)_320px] gap-12 max-lg:grid-cols-1">
            <div className="space-y-10">
              <div className="rounded-[8px] border-l-[5px] border-[#ef3338] bg-[#fff1f2] p-8 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                <div className="flex gap-5 max-sm:flex-col">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#ef3338] text-white"><Icon name="book" className="size-6" /></span>
                  <div>
                    <h2 className="text-[20px] font-black text-[#7f1d1d]">Article Summary</h2>
                    <p className="mt-4 text-[18px] font-semibold italic leading-8 text-[#b91c1c]">{article.summary || article.excerpt}</p>
                  </div>
                </div>
              </div>

              <article className="rounded-[8px] bg-white p-8 text-[16px] leading-8 text-[#374151] shadow-[0_18px_42px_rgba(15,23,42,0.07)] max-sm:p-5">
                <p>{article.excerpt}</p>
                {article.sections.map(([heading, body], index) => (
                  <section key={heading} id={`section-${index + 1}`} className="mt-8">
                    <h2 className="text-[20px] font-black text-[#111827]">{index + 1}. {heading}</h2>
                    <p className="mt-3">{body}</p>
                  </section>
                ))}
                <div className="mt-9 border-t border-[#d9dee8] pt-6">
                  <h2 className="text-[20px] font-black text-[#111827]">Stay safe with JPSPARE</h2>
                  <p className="mt-3">Your safety on the road is our priority. Choose reliable parts, inspect your vehicle regularly, and keep essential maintenance items ready before each journey.</p>
                </div>
              </article>

              <section className="rounded-[8px] bg-white p-8 shadow-[0_18px_42px_rgba(15,23,42,0.07)] max-sm:p-5">
                <h2 className="text-[20px] font-black text-[#111827]">Found this helpful?</h2>
                <p className="mt-2 text-[16px] text-[#667085]">Share this article with fellow automotive enthusiasts</p>
                <div className="mt-7 flex flex-wrap gap-4">
                  <ArticleEngagementActions slug={article.slug} initialSaves={article.saves} initialLikes={article.likes} initialDownloads={article.downloads} />
                  <ArticleUtilityActions article={article} />
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-8 max-lg:grid max-lg:grid-cols-2 max-lg:gap-6 max-sm:grid-cols-1">
              <div className="rounded-[8px] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                <h2 className="text-[18px] font-black">About the Author</h2>
                <div className="mt-5 flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-[12px] bg-[#ef3338] text-white"><Icon name="user" className="size-7" /></span>
                  <div>
                    <h3 className="text-[15px] font-black leading-tight">{article.author}</h3>
                    <p className="mt-1 text-[12px] font-black leading-5 text-[#ef3338]">JPSPARE Automotive Specialist</p>
                  </div>
                </div>
                <p className="mt-4 text-[13px] font-medium leading-6 text-[#667085]">
                  Practical automotive knowledge for safer maintenance, smarter buying decisions, and confident everyday driving.
                </p>
              </div>

              <div className="rounded-[8px] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                <h2 className="text-[18px] font-black">Related Articles</h2>
                <div className="mt-6 grid content-start gap-5">
                  {relatedArticles.map((item) => (
                    <Link key={item.slug} href={`/blog/${item.slug}`} className="group grid grid-cols-[64px_1fr] gap-4">
                      <span className="block h-16 overflow-hidden rounded-[8px] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})`, backgroundPosition: item.position }} />
                      <span>
                        <span className="line-clamp-2 text-[13px] font-black leading-tight text-[#111827] transition group-hover:text-[#ef3338]">{item.title}</span>
                        <span className="mt-1 block text-[12px] font-medium text-[#667085]">{item.read}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
