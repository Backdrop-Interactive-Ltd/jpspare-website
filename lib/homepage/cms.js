import { prisma } from "../db";

export const HOMEPAGE_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR", "PRODUCT_MANAGER"];
export const HOMEPAGE_MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"];

export const homepageSettingKeys = {
  announcement: "homepage.announcement",
  header: "homepage.header",
  navigation: "homepage.navigation",
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
  navigation: {
    main: [
      { label: "HOME", href: "/", enabled: true, sortOrder: 10, hasMenu: false },
      { label: "CAR ACCESSORIES", href: "/collections/car-accessories", enabled: true, sortOrder: 20, hasMenu: true },
      { label: "CAR PARTS", href: "/collections/car-parts", enabled: true, sortOrder: 30, hasMenu: true },
      { label: "TYRES", href: "/collections/tyres", enabled: true, sortOrder: 40, hasMenu: true },
      { label: "LUBRICANT", href: "/collections/lubricant", enabled: true, sortOrder: 50, hasMenu: true },
      { label: "BRANDS", href: "/brands", enabled: true, sortOrder: 60, hasMenu: false },
      { label: "MODIFICATION", href: "/modification", enabled: true, sortOrder: 70, hasMenu: false },
      { label: "OFFERS", href: "/offers", enabled: true, sortOrder: 80, hasMenu: false },
      { label: "COMBO PACKAGE", href: "/combo-package", enabled: true, sortOrder: 90, hasMenu: false },
      { label: "PARTS QUOTE", href: "/parts-quote", enabled: true, sortOrder: 100, hasMenu: false },
    ],
    megaMenu: {
      enabled: true,
      promoCard: {
        enabled: true,
        eyebrow: "Premium",
        title: "Brake Parts",
        subtitle: "Safety. Performance. Reliability.",
        buttonText: "Shop Now",
        buttonLink: "/products?q=brake",
        image: "",
      },
      helpBar: {
        enabled: true,
        title: "Need Help Finding the Right Part?",
        subtitle: "Our experts are ready to help you find the perfect fit.",
        callLabel: "Call Us Now",
        phone: "09617 22 66 88",
        callNumber: "09617 22 66 88",
        chatLabel: "Chat with Expert",
        chatLink: "/help",
        chatText: "We're Online",
      },
      featureCards: [
        { icon: "tag", title: "15% Offer", subtitle: "On selected brake parts", enabled: true, sortOrder: 10 },
        { icon: "shield", title: "100% Authentic", subtitle: "Genuine & Trusted", enabled: true, sortOrder: 20 },
        { icon: "truck", title: "Fast Shipping", subtitle: "Across Bangladesh", enabled: true, sortOrder: 30 },
        { icon: "refresh", title: "Easy Returns", subtitle: "7 Days Return Policy", enabled: true, sortOrder: 40 },
      ],
      featuredBrands: [
        { label: "brembo", href: "/products?brand=brembo", logo: "", enabled: true, sortOrder: 10 },
        { label: "DENSO", href: "/products?brand=denso", logo: "", enabled: true, sortOrder: 20 },
        { label: "akebono", href: "/products?brand=akebono", logo: "", enabled: true, sortOrder: 30 },
        { label: "ADVICS", href: "/products?brand=advics", logo: "", enabled: true, sortOrder: 40 },
        { label: "NGK", href: "/products?brand=ngk", logo: "", enabled: true, sortOrder: 50 },
        { label: "JAPANPARTS", href: "/products?brand=japanparts", logo: "", enabled: true, sortOrder: 60 },
      ],
      categoryRail: [
        { key: "accessories", label: "Accessories", icon: "package", enabled: true, sortOrder: 10 },
        { key: "car-parts", label: "Car Parts", icon: "gear", enabled: true, sortOrder: 20 },
        { key: "tyres", label: "Tyres", icon: "car", enabled: true, sortOrder: 30 },
        { key: "lubricants", label: "Lubricants", icon: "drop", enabled: true, sortOrder: 40 },
      ],
    },
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
        desktopImage: "/jpspare-hero-slide-2.webp",
        mobileImage: "/jpspare-hero-slide-2.webp",
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
    logo: "/jpspare-logo-wide-clean.png",
    footerLogo: "/jpspare-logo.png",
    bottomImage: "/footer-ssl-payment.jpg",
    about: "Building Bangladesh's most trusted online marketplace for genuine car parts, premium automotive accessories, and automotive lifestyle products—delivering authenticity, competitive prices, and a seamless shopping experience.",
    aboutText: "Building Bangladesh's most trusted online marketplace for genuine car parts, premium automotive accessories, and automotive lifestyle products—delivering authenticity, competitive prices, and a seamless shopping experience.",
    copyright: "© 2026 JPSPARE. All rights reserved. | Developed by Backdrop Interactive",
    copyrightText: "© 2026 JPSPARE. All rights reserved. | Developed by Backdrop Interactive",
    contacts: {
      phone: "01718914582",
      secondaryPhone: "09617226688",
      email: "info@jpspare.com.bd",
      address: "167/3/c/3, Mollapara, Taltola, Sher-E-Bangla Nagor, Dhaka-1207",
    },
    contact: {
      phone: "01718914582",
      secondaryPhone: "09617226688",
      email: "info@jpspare.com.bd",
      address: "167/3/c/3, Mollapara, Taltola, Sher-E-Bangla Nagor, Dhaka-1207",
    },
    socials: {
      facebook: "#social",
      instagram: "#social",
      youtube: "#social",
      tiktok: "#social",
    },
    socialLinks: {
      facebook: "#social",
      instagram: "#social",
      youtube: "#social",
    },
    quickLinks: [
      { label: "All Collections", href: "/collection", enabled: true, sortOrder: 10 },
      { label: "Browse Products", href: "/products", enabled: true, sortOrder: 20 },
      { label: "Deals & Offers", href: "/offers", enabled: true, sortOrder: 30 },
    ],
    customerLinks: [
      { label: "Track Your Order", href: "/track-order", enabled: true, sortOrder: 10 },
      { label: "Vehicle Fitment", href: "/products/hitachi-shock-absorver-b3337#compatibility", enabled: true, sortOrder: 20 },
      { label: "Parts Quote", href: "/parts-quote", enabled: true, sortOrder: 30 },
      { label: "Help Center", href: "/help", enabled: true, sortOrder: 40 },
      { label: "Returns & Warranty", href: "/returns-warranty", enabled: true, sortOrder: 50 },
      { label: "Privacy Policy", href: "/privacy-policy", enabled: true, sortOrder: 60 },
    ],
    accountLinks: [
      { label: "Sign In", href: "/signin", enabled: true, sortOrder: 10 },
      { label: "Create Account", href: "/create-account", enabled: true, sortOrder: 20 },
      { label: "My Account", href: "/dashboard", enabled: true, sortOrder: 30 },
      { label: "Wishlist", href: "/wishlisht", enabled: true, sortOrder: 40 },
      { label: "Shopping Cart", href: "/cart", enabled: true, sortOrder: 50 },
    ],
    companyLinks: [
      { label: "About JPSPARE", href: "/about", enabled: true, sortOrder: 10 },
      { label: "Blog & News", href: "/blog", enabled: true, sortOrder: 20 },
      { label: "Video Gallery", href: "/video-gallery", enabled: true, sortOrder: 30 },
      { label: "Contact Us", href: "/help", enabled: true, sortOrder: 40 },
    ],
    paymentIcons: [
      { label: "SSLCommerz", image: "/footer-ssl-payment.jpg", href: "#payment", enabled: true, sortOrder: 10 },
    ],
    appBadges: {
      appStoreImage: "/footer-app-store-badge.png",
      appStoreHref: "#app",
      googlePlayImage: "/footer-google-play-badge.png",
      googlePlayHref: "#app",
    },
    trustBadges: [
      { label: "3000+ Accessories", icon: "check", enabled: true, sortOrder: 10 },
      { label: "98% Satisfaction", icon: "check", enabled: true, sortOrder: 20 },
      { label: "24/7 Support", icon: "check", enabled: true, sortOrder: 30 },
    ],
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
  cms.navigation = normalizeNavigation(settingMap.get(homepageSettingKeys.navigation));
  cms.seo = mergeObject(defaultHomepageCms.seo, settingMap.get(homepageSettingKeys.seo));
  cms.footer = normalizeFooter(settingMap.get(homepageSettingKeys.footer));

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

function normalizeNavigationItem(item, index) {
  const fallback = defaultHomepageCms.navigation.main[index] || {};

  return {
    label: String(item?.label || fallback.label || "").trim(),
    href: String(item?.href || fallback.href || "#").trim(),
    enabled: item?.enabled !== false,
    sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : fallback.sortOrder || (index + 1) * 10,
    hasMenu: item?.hasMenu === undefined ? Boolean(fallback.hasMenu) : item.hasMenu === true,
  };
}

function normalizeNavigation(value) {
  const navigation = mergeObject(defaultHomepageCms.navigation, value);
  const defaultMegaMenu = defaultHomepageCms.navigation.megaMenu;
  const megaMenu = mergeObject(defaultMegaMenu, navigation.megaMenu);

  const main = cleanArray(navigation.main)
    .map(normalizeNavigationItem)
    .filter((item) => item.label && item.href)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  megaMenu.promoCard = mergeObject(defaultMegaMenu.promoCard, megaMenu.promoCard);
  megaMenu.helpBar = mergeObject(defaultMegaMenu.helpBar, megaMenu.helpBar);
  megaMenu.helpBar.phone = String(megaMenu.helpBar.phone || megaMenu.helpBar.callNumber || defaultMegaMenu.helpBar.phone).trim();
  megaMenu.helpBar.callNumber = String(megaMenu.helpBar.callNumber || megaMenu.helpBar.phone || defaultMegaMenu.helpBar.callNumber).trim();
  megaMenu.helpBar.chatLink = String(megaMenu.helpBar.chatLink || defaultMegaMenu.helpBar.chatLink).trim();
  megaMenu.featureCards = cleanArray(megaMenu.featureCards)
    .map((card, index) => ({
      icon: String(card?.icon || "tag").trim(),
      title: String(card?.title || "").trim(),
      subtitle: String(card?.subtitle || "").trim(),
      enabled: card?.enabled !== false,
      sortOrder: Number.isFinite(Number(card?.sortOrder)) ? Number(card.sortOrder) : (index + 1) * 10,
    }))
    .filter((card) => card.title)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  megaMenu.featuredBrands = cleanArray(megaMenu.featuredBrands)
    .map((brand, index) => ({
      label: String(brand?.label || brand?.name || "").trim(),
      href: String(brand?.href || "").trim(),
      logo: String(brand?.logo || "").trim(),
      enabled: brand?.enabled !== false,
      sortOrder: Number.isFinite(Number(brand?.sortOrder)) ? Number(brand.sortOrder) : (index + 1) * 10,
    }))
    .filter((brand) => brand.label && brand.href)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  megaMenu.categoryRail = cleanArray(megaMenu.categoryRail)
    .map((item, index) => ({
      key: String(item?.key || "").trim(),
      label: String(item?.label || "").trim(),
      icon: String(item?.icon || "package").trim(),
      enabled: item?.enabled !== false,
      sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
    }))
    .filter((item) => item.key && item.label)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    main: main.length ? main : clone(defaultHomepageCms.navigation.main),
    megaMenu: {
      ...megaMenu,
      enabled: megaMenu.enabled !== false,
      featureCards: megaMenu.featureCards.length ? megaMenu.featureCards : clone(defaultMegaMenu.featureCards),
      featuredBrands: megaMenu.featuredBrands.length ? megaMenu.featuredBrands : clone(defaultMegaMenu.featuredBrands),
      categoryRail: megaMenu.categoryRail.length ? megaMenu.categoryRail : clone(defaultMegaMenu.categoryRail),
    },
  };
}

function normalizeFooterLink(item, index) {
  return {
    label: String(item?.label || "").trim(),
    href: String(item?.href || "#").trim(),
    enabled: item?.enabled !== false,
    sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
  };
}

function normalizeFooterLinks(value, fallback) {
  const links = cleanArray(value)
    .map(normalizeFooterLink)
    .filter((item) => item.label && item.href)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return links.length ? links : clone(fallback);
}

function normalizePaymentIcons(value, fallback) {
  const icons = cleanArray(value)
    .map((item, index) => ({
      ...normalizeFooterLink(item, index),
      image: String(item?.image || "").trim(),
    }))
    .filter((item) => item.label && item.image)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return icons.length ? icons : clone(fallback);
}

function normalizeFooter(value) {
  const footer = mergeObject(defaultHomepageCms.footer, value);
  const defaultFooter = defaultHomepageCms.footer;
  const contacts = mergeObject(defaultFooter.contacts, footer.contacts || footer.contact);
  const socials = mergeObject(defaultFooter.socials, footer.socials || footer.socialLinks);

  const normalized = {
    ...footer,
    logo: footer.logo || footer.footerLogo || defaultFooter.logo,
    about: footer.about || footer.aboutText || defaultFooter.about,
    copyright: footer.copyright || footer.copyrightText || defaultFooter.copyright,
    contacts,
    socials,
    quickLinks: normalizeFooterLinks(footer.quickLinks, defaultFooter.quickLinks),
    customerLinks: normalizeFooterLinks(footer.customerLinks, defaultFooter.customerLinks),
    accountLinks: normalizeFooterLinks(footer.accountLinks, defaultFooter.accountLinks),
    companyLinks: normalizeFooterLinks(footer.companyLinks, defaultFooter.companyLinks),
    paymentIcons: normalizePaymentIcons(footer.paymentIcons, defaultFooter.paymentIcons),
    appBadges: mergeObject(defaultFooter.appBadges, footer.appBadges),
    trustBadges: cleanArray(footer.trustBadges)
      .map((badge, index) => ({
        label: String(badge?.label || "").trim(),
        icon: String(badge?.icon || "check").trim(),
        enabled: badge?.enabled !== false,
        sortOrder: Number.isFinite(Number(badge?.sortOrder)) ? Number(badge.sortOrder) : (index + 1) * 10,
      }))
      .filter((badge) => badge.label)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };

  normalized.footerLogo = normalized.logo;
  normalized.aboutText = normalized.about;
  normalized.copyrightText = normalized.copyright;
  normalized.contact = mergeObject(defaultFooter.contact, contacts);
  normalized.socialLinks = mergeObject(defaultFooter.socialLinks, socials);
  normalized.bottomImage = normalized.bottomImage || defaultFooter.bottomImage;
  normalized.trustBadges = normalized.trustBadges.length ? normalized.trustBadges : clone(defaultFooter.trustBadges);

  return normalized;
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
  cms.navigation = normalizeNavigation(incoming.navigation);
  cms.seo = mergeObject(cms.seo, incoming.seo);
  cms.footer = normalizeFooter(incoming.footer);

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
    upsertSetting(homepageSettingKeys.navigation, cms.navigation, "navigation"),
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
