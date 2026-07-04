import { prisma } from "@/lib/db";
import { defaultHomepageCms, getHomepageCms } from "@/lib/homepage/cms";

const fallbackSeoManager = defaultHomepageCms.seoManager;

const staticPages = [
  "/",
  "/about",
  "/help",
  "/privacy-policy",
  "/returns-warranty",
  "/terms",
  "/shipping",
  "/faq",
  "/careers",
  "/contact",
  "/blog",
];

function cleanText(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function safeBaseUrl(value) {
  try {
    return new URL(cleanText(value, fallbackSeoManager.global.canonicalBaseUrl)).origin;
  } catch {
    return new URL(fallbackSeoManager.global.canonicalBaseUrl).origin;
  }
}

function absoluteUrl(baseUrl, path) {
  return new URL(path, `${baseUrl}/`).toString();
}

function latestDate(...dates) {
  const validDates = dates.filter(Boolean).map((date) => new Date(date)).filter((date) => !Number.isNaN(date.getTime()));
  return validDates[0] || new Date();
}

function pageEntry(baseUrl, path, options = {}) {
  return {
    url: absoluteUrl(baseUrl, path),
    lastModified: options.lastModified || new Date(),
    changeFrequency: options.changeFrequency || "weekly",
    priority: options.priority ?? 0.7,
  };
}

async function getSeoManager() {
  try {
    const cms = await getHomepageCms();
    return cms?.seoManager || fallbackSeoManager;
  } catch {
    return fallbackSeoManager;
  }
}

async function getProductEntries(baseUrl) {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });

    return products
      .filter((product) => product.slug)
      .map((product) =>
        pageEntry(baseUrl, `/products/${product.slug}`, {
          lastModified: latestDate(product.updatedAt, product.createdAt),
          changeFrequency: "weekly",
          priority: 0.8,
        })
      );
  } catch {
    return [];
  }
}

async function getCategoryEntries(baseUrl) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    return categories
      .filter((category) => category.slug)
      .map((category) =>
        pageEntry(baseUrl, `/collections/${category.slug}`, {
          lastModified: latestDate(category.updatedAt, category.createdAt),
          changeFrequency: "weekly",
          priority: 0.7,
        })
      );
  } catch {
    return [];
  }
}

async function getBrandEntries(baseUrl) {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });

    return brands
      .filter((brand) => brand.slug)
      .map((brand) =>
        pageEntry(baseUrl, `/products?brand=${encodeURIComponent(brand.slug)}`, {
          lastModified: latestDate(brand.updatedAt, brand.createdAt),
          changeFrequency: "weekly",
          priority: 0.6,
        })
      );
  } catch {
    return [];
  }
}

async function getBlogPostEntries(baseUrl) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, publishedAt: true, updatedAt: true, createdAt: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    return posts
      .filter((post) => post.slug)
      .map((post) =>
        pageEntry(baseUrl, `/blog/${post.slug}`, {
          lastModified: latestDate(post.updatedAt, post.publishedAt, post.createdAt),
          changeFrequency: "monthly",
          priority: 0.6,
        })
      );
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const seoManager = await getSeoManager();
  const sitemapConfig = seoManager.sitemap || fallbackSeoManager.sitemap;

  if (sitemapConfig.enabled === false) {
    return [];
  }

  const baseUrl = safeBaseUrl(seoManager.global?.canonicalBaseUrl);
  const entries = [];

  if (sitemapConfig.includeStaticPages !== false) {
    entries.push(
      ...staticPages.map((path) =>
        pageEntry(baseUrl, path, {
          changeFrequency: path === "/" ? "daily" : "monthly",
          priority: path === "/" ? 1 : 0.7,
        })
      )
    );
  }

  if (sitemapConfig.includeProducts !== false) {
    entries.push(...(await getProductEntries(baseUrl)));
  }

  if (sitemapConfig.includeCategories !== false) {
    entries.push(...(await getCategoryEntries(baseUrl)));
  }

  if (sitemapConfig.includeBrands !== false) {
    entries.push(...(await getBrandEntries(baseUrl)));
  }

  if (sitemapConfig.includeBlogPosts !== false) {
    entries.push(...(await getBlogPostEntries(baseUrl)));
  }

  return entries;
}
