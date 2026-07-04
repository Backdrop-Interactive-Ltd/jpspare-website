import BlogPageClient from "./BlogPageClient";
import { prisma } from "../../lib/db";
import { articles as staticArticles } from "./articles";

export const metadata = {
  title: "Blog & News | JPSPARE",
  description: "Automotive maintenance tips, technical guides, and expert insights from JPSPARE.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    sections: [],
  };
}

async function getBlogArticles() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    });

    if (!posts.length) return staticArticles;
    return posts.map(mapBlogPostToArticle);
  } catch {
    return staticArticles;
  }
}

export default async function BlogPage() {
  const articles = await getBlogArticles();
  return <BlogPageClient initialArticles={articles} />;
}
