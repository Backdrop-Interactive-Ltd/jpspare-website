import Link from "next/link";
import TopDealBar from "./TopDealBar";
import ProductTabs, { BestSellingAutoParts, FeaturedOfferBanners, LatestJapaneseAutoParts } from "./ProductTabs";
import CustomerReviews from "./CustomerReviews";
import CompareHashRedirect from "./CompareHashRedirect";
import PartsInquirySection from "./PartsInquirySection";
import SlideManualControls from "./SlideManualControls";
import { Header } from "./homepage/site-header";
import { premiumBrands, categoryShowcase as staticCategoryShowcase, heroCategorySlider } from "./homepage/homepage-data";
import { Icon, slugify } from "./homepage/homepage-ui-helpers";
import { articles as staticArticles } from "./blog/articles";
import { defaultHomepageCms, getHomepageCms } from "@/lib/homepage/cms";
import { getHomepageCategoryViewModel } from "@/lib/homepage/categories";
import { prisma } from "../lib/db";

const fallbackHomepageSeo = {
  title: "JPSPARE | Premium Auto Parts & Accessories",
  description: "Shop demo premium auto parts and accessories for Japanese vehicles.",
  ogImage: "/jpspare-logo-wide-clean.png",
  canonicalBaseUrl: defaultHomepageCms.seoManager.global.canonicalBaseUrl,
};

function cleanSeoText(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function safeSeoUrl(value, fallback) {
  try {
    return new URL(cleanSeoText(value, fallback)).toString();
  } catch {
    return new URL(fallback).toString();
  }
}

function safeSeoImage(value, baseUrl, fallback) {
  const image = cleanSeoText(value, fallback);
  try {
    return new URL(image, baseUrl).toString();
  } catch {
    return new URL(fallback, baseUrl).toString();
  }
}

async function getHomepageSeoManager() {
  try {
    const cms = await getHomepageCms();
    return cms?.seoManager || defaultHomepageCms.seoManager;
  } catch {
    return defaultHomepageCms.seoManager;
  }
}

export async function generateMetadata() {
  const seoManager = await getHomepageSeoManager();
  const global = seoManager?.global || {};
  const homepage = seoManager?.homepage || {};
  const canonicalBaseUrl = safeSeoUrl(global.canonicalBaseUrl, fallbackHomepageSeo.canonicalBaseUrl);
  const title = cleanSeoText(homepage.title, cleanSeoText(global.defaultTitle, fallbackHomepageSeo.title));
  const description = cleanSeoText(homepage.description, cleanSeoText(global.defaultDescription, fallbackHomepageSeo.description));
  const image = safeSeoImage(homepage.ogImage, canonicalBaseUrl, cleanSeoText(global.defaultOgImage, fallbackHomepageSeo.ogImage));

  return {
    title,
    description,
    alternates: {
      canonical: canonicalBaseUrl,
    },
    openGraph: {
      title,
      description,
      images: [image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      images: [image],
    },
  };
}

function Hero() {
  const image3Slides = [
    {
      src: "/hero-image-3-slide-1.webp",
      alt: "Mobil 1 engine oil genuine product banner",
    },
    {
      src: "/hero-image-3-slide-2.webp",
      alt: "Yesido VC13 car jump starter banner",
    },
    {
      src: "/hero-image-3-slide-3.webp",
      alt: "Car cover protection service banner",
    },
  ];

  return (
    <section className="bg-[#f2f3f5] pt-0 pb-4">
      <div className="grid w-full max-w-none gap-3 bg-[#f2f3f5] md:grid-cols-[minmax(0,4fr)_minmax(220px,1fr)]">
        <section className="relative h-[220px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-[665px]" aria-label="Mobil online shopping banner">
          <img
            src="/hero-image-1-mobil-banner.webp"
            alt="Buy Mobil online with home delivery"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>
        <div className="grid h-[292px] gap-3 md:h-[665px] md:grid-rows-[1fr_2fr]">
          <section className="hero-zoom-panel relative h-[110px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-auto md:min-h-0" aria-label="Download app offer banner">
            <img
              src="/hero-image-2-app-banner.webp"
              alt="Download the app and get 250 off on your first order"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </section>
          <section className="manual-slide-shell hero-zoom-panel relative h-[170px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-auto md:min-h-0" aria-label="Promotional banner slider">
            <div className="hero-image-3-track absolute inset-0">
              {[...image3Slides, image3Slides[0]].map((slide, index) => (
                <img
                  key={`${slide.src}-${index}`}
                  src={slide.src}
                  alt={index === image3Slides.length ? "" : slide.alt}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function HeroFeatureStrip() {
  const features = [
    {
      icon: "tag",
      title: "Competitive Price",
      text: "Get The Best Prices Everyday",
    },
    {
      icon: "award",
      title: "Authentic Products",
      text: "Secured with Brand Warranty",
    },
    {
      icon: "card",
      title: "Easy & Secured Payment",
      text: "Pre-payment, Cash on Delivery",
    },
    {
      icon: "truck",
      title: "Fast Delivery",
      text: "Rapid delivery At Your Doorstep",
    },
    {
      icon: "rotate",
      title: "7-Day Easy Returns",
      text: "Hassle-free returns and replacements with full warranty",
    },
    {
      icon: "headphones",
      title: "Expert Support Team",
      text: "Professional automotive specialists available 7 days a week",
    },
  ];

  return (
    <section className="bg-[#f2f3f5] py-3">
      <div className="mx-auto grid w-[calc(100%-40px)] max-w-none grid-cols-6 gap-3 sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)] max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group/feature relative flex min-h-[66px] items-center gap-3 overflow-hidden rounded-[10px] border border-white/85 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] px-4 py-2.5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.055)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ffd2d3] hover:shadow-[0_16px_30px_rgba(239,51,56,0.10)]"
          >
            <span className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,#ff3b40,transparent)] opacity-0 transition group-hover/feature:opacity-100" />
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#f7f7fa] text-[#ef3338] shadow-[inset_0_0_0_1px_#eceef3] transition group-hover/feature:bg-white group-hover/feature:shadow-[inset_0_0_0_1px_#ffd2d3,0_8px_18px_rgba(239,51,56,0.10)]">
              <Icon name={feature.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[16px] font-semibold leading-tight text-[#111827]">{feature.title}</span>
              <span className="mt-1 block text-[13px] font-medium leading-snug text-[#8a93a3]">{feature.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroCategorySlider() {
  return (
    <section className="bg-transparent pt-2 pb-3">
      <div className="w-full max-w-none">
        <div className="manual-slide-shell category-marquee relative overflow-hidden rounded-[10px] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="category-marquee-track flex w-max items-center">
            {[0, 1, 2, 3].map((group) => (
              <div key={group} className="flex shrink-0 items-center gap-2 pr-2">
                {heroCategorySlider.map((item) => (
                  <a
                    key={`${item.label}-${group}`}
                    href={item.href}
                    className="flex h-9 shrink-0 items-center gap-2 rounded-[4px] bg-[#ffe5ee] px-3.5 text-[14px] font-black leading-none text-[#2b2529] shadow-[inset_0_0_0_1px_rgba(255,216,226,0.9)] transition hover:bg-[#ffd5e3] hover:text-[#d41667]"
                  >
                    <span className="text-[17px] leading-none">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase({ groups = staticCategoryShowcase }) {
  return (
    <section id="categories" className="bg-transparent pt-3 pb-4 max-sm:py-3">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          HANDPICKED CATAGORIES
        </div>
        <a
          href="/category"
          className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-[7px] bg-[#ef3338] px-4 text-[11px] font-black leading-none !text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d] hover:shadow-[0_10px_20px_rgba(239,51,56,0.18)]"
        >
          View all
        </a>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-7 lg:w-[calc(100%-80px)] lg:p-10">
        <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
          {groups.map((group, groupIndex) => {
            const theme = group.theme || staticCategoryShowcase[groupIndex % staticCategoryShowcase.length]?.theme || staticCategoryShowcase[0].theme;
            const items = group.items?.length ? group.items : group.children || [];

            return (
              <article key={group.id || group.title} className={`group/showcase relative overflow-hidden rounded-[8px] border p-6 shadow-[0_10px_24px_rgba(15,23,42,0.045)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:opacity-0 before:transition-opacity hover:-translate-y-0.5 hover:before:opacity-100 ${theme.card}`}>
                <div className="mb-[14px] flex items-center justify-between gap-3">
                  <h2 className={`min-w-0 truncate text-[15px] font-black leading-5 transition ${theme.title}`}>{group.title || group.name}</h2>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                  {items.map((item) => {
                    const label = item.label || item.name;
                    const href = item.href || `#${slugify(label)}`;
                    const imageUrl = item.imageUrl || "/japanparts-reference.png";

                    return (
                      <a key={item.id || label} href={href} className="group/category block">
                        <div
                          className={`relative h-[150px] overflow-hidden rounded-[7px] bg-[#f5f6f8] bg-no-repeat shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)] ${item.crop || "bg-center bg-contain"} ${theme.itemStroke} transition duration-200 after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_45%,rgba(17,24,39,0.18)_100%)] after:opacity-0 after:transition group-hover/category:scale-[1.015] group-hover/category:shadow-[0_10px_22px_rgba(15,23,42,0.14)] group-hover/category:after:opacity-100 max-sm:h-[170px]`}
                          style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: item.crop ? "1920px 957px" : undefined }}
                        />
                        <p className="mt-[7px] truncate text-[14px] font-semibold leading-5 text-[#4b5563] transition group-hover/category:text-[#ef3338]">{label}</p>
                      </a>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PremiumAuthenticVideoSection() {
  return (
    <section className="bg-transparent py-5 max-sm:py-4">
      <div className="mx-auto w-[calc(100%-40px)] max-w-none sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="relative min-h-[430px] w-full overflow-hidden rounded-[12px] bg-[#050505] sm:min-h-[500px] lg:min-h-[560px]">
          <img
            src="/jpspare-hero-slide-1.gif"
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.18),rgba(0,0,0,0.74))]" />
          <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 mx-auto flex min-h-[430px] w-full max-w-none flex-col items-center justify-center px-4 py-16 text-center text-white sm:min-h-[500px] lg:min-h-[560px]">
            <h2 className="text-[34px] font-black uppercase leading-[1.05] tracking-[0.02em] text-white sm:text-[46px] lg:text-[64px]">
              100% Premium & Authentic
            </h2>
            <p className="mt-6 max-w-[650px] text-[15px] font-bold leading-7 text-white sm:text-[17px]">
              All our products are premium branded and 100% authentic. Whatever you buy it will work.
            </p>
            <Link
              href="/products"
              className="mt-10 inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-white px-8 text-[15px] font-bold leading-none !text-[#111827] shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition duration-200 hover:scale-[1.03] hover:bg-[#fff2f2] hover:shadow-[0_18px_38px_rgba(239,51,56,0.2)]"
            >
              Explore More
              <Icon name="arrow" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumBrandsSection() {
  return (
    <section id="brands" className="bg-transparent py-6 max-sm:py-4">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          PREMIUM PARTNERS
        </div>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)] lg:p-8">
        <div className="manual-slide-shell brand-marquee pb-5 pt-3 text-left" data-loop-copies="4">
          <SlideManualControls step={4} />
          <div className="brand-marquee-track flex w-max gap-8 max-sm:gap-4">
          {[...premiumBrands, ...premiumBrands, ...premiumBrands, ...premiumBrands].map((brand, index) => (
            <a
              key={`${brand.name}-${index}`}
              href={`#${slugify(brand.name)}`}
              className="group/brand relative flex h-[94px] w-[128px] shrink-0 flex-col items-center justify-center rounded-[10px] border border-[#dfe4ea] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)]"
            >
              <span className="absolute right-1 top-1 size-3 rounded-full border-2 border-white bg-[#20c86b]" />
              <span className={`grid h-8 min-w-[60px] place-items-center rounded-[4px] px-2 text-[13px] font-black ${brand.color}`}>{brand.short}</span>
              <span className="mt-3 text-[12px] font-black text-[#1f2937] transition group-hover/brand:text-[#d3191d]">{brand.name}</span>
            </a>
          ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function formatArticleDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function mapBlogPostToArticle(post) {
  const category = post.category?.name || "General";
  return {
    title: post.title,
    slug: post.slug,
    category,
    date: formatArticleDate(post.publishedAt || post.createdAt),
    author: post.authorName || "JPSPARE Experts",
    excerpt: post.excerpt || "",
    image: post.featuredImage || "/jpspare-logo.png",
    tag: post.tags?.[0] || category,
  };
}

async function getHomepageFeaturedArticles() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", featured: true },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        authorName: true,
        publishedAt: true,
        createdAt: true,
        tags: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 4,
    });

    if (!posts.length) return staticArticles.slice(0, 4);
    return posts.map(mapBlogPostToArticle);
  } catch {
    return staticArticles.slice(0, 4);
  }
}

function campaignTypeLabel(type) {
  return String(type || "CUSTOM")
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function mapCampaignToHomepageCard(campaign) {
  return {
    name: campaign.name,
    slug: campaign.slug,
    type: campaignTypeLabel(campaign.type),
    image: campaign.bannerImage,
    title: campaign.seoTitle || campaign.name,
    description: campaign.seoDescription || "Limited-time JPSPARE campaign on premium automotive parts and accessories.",
    startsAt: campaign.startsAt,
    endsAt: campaign.endsAt,
  };
}

async function getHomepageCampaignPicks() {
  const now = new Date();

  try {
    const campaigns = await prisma.promotionCampaign.findMany({
      where: {
        status: "ACTIVE",
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          { OR: [{ landingPageEnabled: true }, { bannerImage: { not: null } }] },
        ],
      },
      select: {
        name: true,
        slug: true,
        type: true,
        bannerImage: true,
        seoTitle: true,
        seoDescription: true,
        startsAt: true,
        endsAt: true,
      },
      orderBy: [{ priority: "desc" }, { startsAt: "desc" }, { createdAt: "desc" }],
      take: 4,
    });

    return campaigns.map(mapCampaignToHomepageCard);
  } catch (error) {
    console.error("[Homepage Campaigns] Failed to load campaigns", {
      message: error?.message,
      code: error?.code,
    });
    return [];
  }
}

function CampaignPicksSection({ campaigns }) {
  if (!campaigns.length) return null;

  return (
    <section className="bg-transparent py-6 max-sm:py-4">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          CURRENT CAMPAIGNS
        </div>
        <Link
          href="/offers"
          className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-[7px] bg-[#ef3338] px-4 text-[11px] font-black leading-none !text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d] hover:shadow-[0_10px_20px_rgba(239,51,56,0.18)]"
        >
          View all
        </Link>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)]">
        <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.slug}
              href="/offers"
              className="group overflow-hidden rounded-[8px] border border-[#e5eaf1] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#f2c7c9] hover:shadow-[0_20px_42px_rgba(239,51,56,0.10)]"
            >
              <span className="relative block h-[190px] overflow-hidden bg-[#111827]">
                {campaign.image ? (
                  <span
                    className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
                    style={{ backgroundImage: `url(${campaign.image})` }}
                  />
                ) : (
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(239,51,56,0.35),transparent_32%),linear-gradient(135deg,#111827,#0b1220)]" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/0" />
                <span className="absolute left-4 top-4 rounded-[6px] bg-[#ef3338] px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-[0_10px_22px_rgba(239,51,56,0.25)]">
                  {campaign.type}
                </span>
              </span>
              <span className="block p-5">
                <span className="line-clamp-2 block text-[18px] font-black leading-tight text-[#111827] transition group-hover:text-[#ef3338]">
                  {campaign.title}
                </span>
                <span className="mt-3 line-clamp-2 block text-[13px] font-medium leading-6 text-[#667085]">
                  {campaign.description}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 text-[12px] font-black text-[#111827] transition group-hover:text-[#ef3338]">
                  View Offer <Icon name="arrow" className="size-3 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedArticlesSection({ articles }) {
  return (
    <section className="bg-transparent py-6 max-sm:py-4">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          FEATURED ARTICLES
        </div>
        <Link
          href="/blog"
          className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-[7px] bg-[#ef3338] px-4 text-[11px] font-black leading-none !text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d] hover:shadow-[0_10px_20px_rgba(239,51,56,0.18)]"
        >
          View all
        </Link>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)]">
        <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group overflow-hidden rounded-[8px] border border-[#e5eaf1] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#f2c7c9] hover:shadow-[0_20px_42px_rgba(239,51,56,0.10)]"
            >
              <span className="relative block h-[190px] overflow-hidden bg-[#111827]">
                <span
                  className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${article.image})` }}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/5" />
                <span className="absolute left-4 top-4 rounded-[6px] bg-[#ef3338] px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-[0_10px_22px_rgba(239,51,56,0.25)]">
                  {article.category}
                </span>
              </span>
              <span className="block p-5">
                <span className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.06em] text-[#98a2b3]">
                  <span>{article.date}</span>
                  <span>{article.author}</span>
                </span>
                <span className="mt-3 line-clamp-2 block text-[18px] font-black leading-tight text-[#111827] transition group-hover:text-[#ef3338]">
                  {article.title}
                </span>
                <span className="mt-3 line-clamp-2 block text-[13px] font-medium leading-6 text-[#667085]">
                  {article.excerpt}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 text-[12px] font-black text-[#111827] transition group-hover:text-[#ef3338]">
                  Continue Reading <Icon name="arrow" className="size-3 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const featuredArticles = await getHomepageFeaturedArticles();
  const campaignPicks = await getHomepageCampaignPicks();
  const homepageCategories = await getHomepageCategoryViewModel();

  return (
    <main className="min-h-screen bg-[#f2f3f5] text-[#111827]">
      <CompareHashRedirect />
      <TopDealBar />
      <Header />
      <Hero />
      <HeroFeatureStrip />
      <CategoryShowcase groups={homepageCategories.categoryShowcase} />
      <LatestJapaneseAutoParts />
      <HeroCategorySlider />
      <section className="bg-transparent py-4">
        <div className="mx-auto w-[calc(100%-40px)] max-w-none sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
          <FeaturedOfferBanners />
        </div>
      </section>
      <ProductTabs />
      <PremiumAuthenticVideoSection />
      <BestSellingAutoParts />
      <PremiumBrandsSection />
      <CampaignPicksSection campaigns={campaignPicks} />
      <FeaturedArticlesSection articles={featuredArticles} />
      <CustomerReviews />
      <PartsInquirySection />
      <section id="parts" className="sr-only">
        <h2>Demo parts results</h2>
      </section>
      <section id="track-order" className="sr-only">
        <h2>Track order demo section</h2>
      </section>
    </main>
  );
}
