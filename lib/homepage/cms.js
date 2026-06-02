import { prisma } from "../db";

export const HOMEPAGE_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR", "PRODUCT_MANAGER"];
export const HOMEPAGE_MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"];

export const homepageSettingKeys = {
  announcement: "homepage.announcement",
  header: "homepage.header",
  seo: "homepage.seo",
  footer: "homepage.footer",
};

export const homepageSectionKeys = {
  heroSlider: "homepage.hero-slider",
  featuredCategories: "homepage.featured-categories",
  featuredProducts: "homepage.featured-products",
  promoBanners: "homepage.promo-banners",
  brandShowcase: "homepage.brand-showcase",
};

export const defaultHomepageCms = {
  announcement: {
    enabled: true,
    text: "Today deal sale off 80%. End in",
    secondaryText: "Shop over 7000 Tk get free delivery",
    buttonText: "Hurry Up →",
    buttonLink: "/offers",
    rotationIntervalMs: 10450,
  },
  header: {
    logo: "/jpspare-logo-wide-clean.png",
    contactNumber: "01718914582",
    searchPlaceholders: [
      "Search for authentic parts...",
      "Search for accessories...",
      "Search for lubricant...",
      "Search for tyres...",
      "Search for rims...",
      "Search for car care products...",
      "Search for suspension parts...",
      "Search for brake pads...",
      "Search for engine oil...",
      "Search for detailing products...",
    ],
    stickySearchHeader: true,
    stickyCategoryHeader: false,
  },
  heroSlider: {
    enabled: true,
    slides: [
      {
        id: "hero-pirelli",
        desktopImage: "/jpspare-hero-slide-1.gif",
        mobileImage: "/jpspare-hero-slide-1.gif",
        alt: "Pirelli podium cap special edition banner",
        heading: "From the Track to the Streets",
        subheading: "Discover the Pirelli Podium Cap Special Editions.",
        ctaText: "Buy Now",
        ctaLink: "/tyres",
        active: true,
      },
      {
        id: "hero-mobil-online",
        desktopImage: "/jpspare-hero-slide-2.png",
        mobileImage: "/jpspare-hero-slide-2.png",
        alt: "Mobil online shopping delivery banner",
        heading: "Mobil Delivered Nationwide",
        subheading: "Order premium engine oil and car care products online.",
        ctaText: "Shop Lubricants",
        ctaLink: "/lubricant",
        active: true,
      },
      {
        id: "hero-mobil-1",
        desktopImage: "/jpspare-hero-slide-3.jpg",
        mobileImage: "/jpspare-hero-slide-3.jpg",
        alt: "Mobil 1 synthetic motor oil brand banner",
        heading: "World Leading Synthetic Motor Oil",
        subheading: "Premium lubricant solutions for modern engines.",
        ctaText: "Explore Mobil",
        ctaLink: "/brands",
        active: true,
      },
    ],
  },
  featuredCategories: {
    enabled: true,
    categoryIds: [],
  },
  featuredProducts: {
    enabled: true,
    productIds: [],
    featuredOnly: true,
    limit: 20,
  },
  promoBanners: {
    enabled: true,
    banners: [],
  },
  brandShowcase: {
    enabled: true,
    brandIds: [],
    autoSlider: true,
  },
  seo: {
    metaTitle: "JPSPARE | Premium Auto Parts & Accessories",
    metaDescription: "Authentic Japanese automotive parts, accessories, tyres, lubricant, and car care products.",
    keywords: "JPSPARE, auto parts, car accessories, tyres, lubricant, Japanese parts",
    ogImage: "/jpspare-logo-wide-clean.png",
  },
  footer: {
    footerLogo: "/jpspare-logo.png",
    aboutText: "Authentic Japanese automotive parts with guaranteed quality and nationwide shipping.",
    copyrightText: "© 2024 JPSPARE. All rights reserved.",
    contact: {
      phone: "01718914582",
      email: "info@jpspare.com.bd",
      address: "277 Tejgaon I/A, Dhaka -1208",
    },
    socialLinks: {
      facebook: "#social",
      instagram: "#social",
      youtube: "#social",
    },
    quickLinks: [],
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeObject(defaultValue, savedValue) {
  if (!savedValue || Array.isArray(savedValue) || typeof savedValue !== "object") return clone(defaultValue);
  return { ...clone(defaultValue), ...savedValue };
}

function normalizeCms(settings = [], sections = []) {
  const settingMap = new Map(settings.map((item) => [item.key, item.value]));
  const sectionMap = new Map(sections.map((item) => [item.key, item]));

  const cms = clone(defaultHomepageCms);

  cms.announcement = normalizeAnnouncementCta(mergeObject(defaultHomepageCms.announcement, settingMap.get(homepageSettingKeys.announcement)));
  cms.announcement.rotationIntervalMs = Math.max(2500, Math.min(30000, Number(cms.announcement.rotationIntervalMs) || 10450));
  delete cms.announcement.primaryStyle;
  delete cms.announcement.secondaryStyle;
  cms.header = mergeObject(defaultHomepageCms.header, settingMap.get(homepageSettingKeys.header));
  cms.seo = mergeObject(defaultHomepageCms.seo, settingMap.get(homepageSettingKeys.seo));
  cms.footer = mergeObject(defaultHomepageCms.footer, settingMap.get(homepageSettingKeys.footer));

  for (const [name, key] of Object.entries(homepageSectionKeys)) {
    const section = sectionMap.get(key);
    cms[name] = mergeObject(defaultHomepageCms[name], section?.content);
    if (section) cms[name].enabled = section.isActive;
  }

  if (!Array.isArray(cms.header.searchPlaceholders) || !cms.header.searchPlaceholders.length) {
    cms.header.searchPlaceholders = defaultHomepageCms.header.searchPlaceholders;
  }

  if (!Array.isArray(cms.heroSlider.slides) || !cms.heroSlider.slides.length) {
    cms.heroSlider.slides = defaultHomepageCms.heroSlider.slides;
  }

  return cms;
}

export async function getHomepageCms() {
  try {
    const [settings, sections] = await prisma.$transaction([
      prisma.siteSetting.findMany({
        where: { key: { in: Object.values(homepageSettingKeys) } },
      }),
      prisma.homeSection.findMany({
        where: { key: { in: Object.values(homepageSectionKeys) } },
        orderBy: [{ sortOrder: "asc" }],
      }),
    ]);

    return normalizeCms(settings, sections);
  } catch (error) {
    console.error("Homepage CMS fallback:", error);
    return clone(defaultHomepageCms);
  }
}

function normalizeProduct(product) {
  const thumbnail = product.images?.find((image) => image.isThumbnail) || product.images?.[0];
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price ? String(product.price) : "0",
    discountPrice: product.discountPrice ? String(product.discountPrice) : "",
    status: product.status,
    isFeatured: product.isFeatured,
    image: thumbnail?.url || "",
  };
}

export async function getHomepageAdminOptions() {
  const [categories, products, brands] = await prisma.$transaction([
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, thumbnailUrl: true, iconUrl: true, parentId: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { status: { in: ["DRAFT", "ACTIVE", "ARCHIVED"] } },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        discountPrice: true,
        status: true,
        isFeatured: true,
        images: {
          select: { url: true, isThumbnail: true, sortOrder: true },
          orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
          take: 2,
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 250,
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, logoUrl: true, isFeatured: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
  ]);

  return {
    categories,
    products: products.map(normalizeProduct),
    brands,
  };
}

function formatTaka(value) {
  const amount = Number(value || 0);
  return `Tk ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function normalizeHomepageProduct(product) {
  const thumbnail = product.images?.find((image) => image.isThumbnail) || product.images?.[0];

  return {
    category: product.category?.name || product.brand?.name || "JPSPARE",
    name: product.title,
    price: formatTaka(product.discountPrice || product.price),
    oldPrice: product.discountPrice ? formatTaka(product.price) : "",
    reviews: 5,
    image: thumbnail?.url || product.thumbnailUrl || "",
    slug: product.slug,
  };
}

export async function getHomepageFeaturedProducts(cms) {
  try {
    const featuredConfig = cms?.featuredProducts || defaultHomepageCms.featuredProducts;
    const selectedIds = cleanArray(featuredConfig.productIds);
    const limit = Math.max(1, Math.min(60, Number(featuredConfig.limit) || 20));
    const where = selectedIds.length
      ? { id: { in: selectedIds } }
      : {
          status: "ACTIVE",
          ...(featuredConfig.featuredOnly === false ? {} : { isFeatured: true }),
        };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: {
          select: { url: true, isThumbnail: true, sortOrder: true },
          orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
          take: 2,
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });

    if (!selectedIds.length) return products.map(normalizeHomepageProduct);

    const rank = new Map(selectedIds.map((id, index) => [id, index]));
    return products
      .sort((a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999))
      .map(normalizeHomepageProduct);
  } catch (error) {
    console.error("Homepage featured products fallback:", error);
    return [];
  }
}

function cleanArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeAnnouncementCta(announcement) {
  const ctaPattern = /(?:\s*\.?\s*)(Hurry Up\s*→?)\s*$/i;
  const text = String(announcement.text || "");
  const match = text.match(ctaPattern);

  if (!match) return announcement;

  return {
    ...announcement,
    text: text.replace(ctaPattern, "").trim(),
    buttonText: announcement.buttonText || "Hurry Up →",
  };
}

function sanitizeCmsPayload(payload = {}) {
  const cms = normalizeCms([], []);
  const incoming = payload || {};

  cms.announcement = normalizeAnnouncementCta(mergeObject(cms.announcement, incoming.announcement));
  cms.announcement.rotationIntervalMs = Math.max(2500, Math.min(30000, Number(cms.announcement.rotationIntervalMs) || 10450));
  delete cms.announcement.primaryStyle;
  delete cms.announcement.secondaryStyle;
  cms.header = mergeObject(cms.header, incoming.header);
  cms.header.searchPlaceholders = cleanArray(cms.header.searchPlaceholders).map((item) => String(item).trim()).filter(Boolean);
  cms.seo = mergeObject(cms.seo, incoming.seo);
  cms.footer = mergeObject(cms.footer, incoming.footer);

  cms.heroSlider = mergeObject(cms.heroSlider, incoming.heroSlider);
  cms.heroSlider.slides = cleanArray(cms.heroSlider.slides).map((slide, index) => ({
    id: slide.id || `slide-${Date.now()}-${index}`,
    desktopImage: slide.desktopImage || slide.src || "",
    mobileImage: slide.mobileImage || slide.desktopImage || slide.src || "",
    alt: slide.alt || slide.heading || "JPSPARE hero banner",
    heading: slide.heading || "",
    subheading: slide.subheading || "",
    ctaText: slide.ctaText || "",
    ctaLink: slide.ctaLink || "",
    active: slide.active !== false,
  }));

  cms.featuredCategories = mergeObject(cms.featuredCategories, incoming.featuredCategories);
  cms.featuredCategories.categoryIds = cleanArray(cms.featuredCategories.categoryIds);

  cms.featuredProducts = mergeObject(cms.featuredProducts, incoming.featuredProducts);
  cms.featuredProducts.productIds = cleanArray(cms.featuredProducts.productIds);
  cms.featuredProducts.limit = Math.max(1, Math.min(60, Number(cms.featuredProducts.limit) || 20));

  cms.promoBanners = mergeObject(cms.promoBanners, incoming.promoBanners);
  cms.promoBanners.banners = cleanArray(cms.promoBanners.banners).map((banner, index) => ({
    id: banner.id || `promo-${Date.now()}-${index}`,
    image: banner.image || "",
    title: banner.title || "",
    subtitle: banner.subtitle || "",
    ctaText: banner.ctaText || "",
    ctaLink: banner.ctaLink || "",
    active: banner.active !== false,
  }));

  cms.brandShowcase = mergeObject(cms.brandShowcase, incoming.brandShowcase);
  cms.brandShowcase.brandIds = cleanArray(cms.brandShowcase.brandIds);

  return cms;
}

function upsertSetting(key, value, group) {
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value, group, isPublic: true },
    update: { value, group, isPublic: true },
  });
}

function upsertSection(key, title, type, content, sortOrder, isActive) {
  return prisma.homeSection.upsert({
    where: { key },
    create: { key, title, type, content, sortOrder, isActive },
    update: { title, type, content, sortOrder, isActive },
  });
}

export async function saveHomepageCms(payload) {
  const cms = sanitizeCmsPayload(payload);

  await prisma.$transaction([
    upsertSetting(homepageSettingKeys.announcement, cms.announcement, "homepage"),
    upsertSetting(homepageSettingKeys.header, cms.header, "homepage"),
    upsertSetting(homepageSettingKeys.seo, cms.seo, "homepage"),
    upsertSetting(homepageSettingKeys.footer, cms.footer, "footer"),
    upsertSection(homepageSectionKeys.heroSlider, "Hero Banner Slider", "hero", cms.heroSlider, 10, cms.heroSlider.enabled !== false),
    upsertSection(homepageSectionKeys.featuredCategories, "Featured Categories", "categories", cms.featuredCategories, 20, cms.featuredCategories.enabled !== false),
    upsertSection(homepageSectionKeys.featuredProducts, "Featured Products", "products", cms.featuredProducts, 30, cms.featuredProducts.enabled !== false),
    upsertSection(homepageSectionKeys.promoBanners, "Promo Banners", "banners", cms.promoBanners, 40, cms.promoBanners.enabled !== false),
    upsertSection(homepageSectionKeys.brandShowcase, "Brand Showcase", "brands", cms.brandShowcase, 50, cms.brandShowcase.enabled !== false),
  ]);

  return cms;
}
