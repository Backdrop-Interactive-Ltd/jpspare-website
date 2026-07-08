import { prisma } from "../db";

const FALLBACK_IMAGE = "/japanparts-reference.png";

export const fallbackCategoryShowcase = [
  {
    title: "GENUINE AUTO PARTS",
    theme: {
      card: "border-[#ffd2d3] bg-[linear-gradient(180deg,#ffffff_0%,#fff3f3_100%)] before:bg-[#ef3338] hover:border-[#ffb6b9] hover:bg-[linear-gradient(180deg,#fffafa_0%,#ffeded_100%)] hover:shadow-[0_18px_36px_rgba(239,51,56,0.13)]",
      title: "text-[#ef3338] group-hover/showcase:text-[#d71920]",
      itemStroke: "group-hover/category:ring-2 group-hover/category:ring-[#ef3338]/45",
    },
    items: [
      { label: "Brake Pads", crop: "bg-[-1082px_-494px]" },
      { label: "Shock Absorber", crop: "bg-[-1192px_-248px]" },
      { label: "Spark Plug", crop: "bg-[-1090px_-300px]" },
      { label: "Head Light Set", crop: "bg-[-1510px_-421px]" },
    ],
  },
  {
    title: "CAR ACCESSORIES",
    theme: {
      card: "border-[#ffe2c4] bg-[linear-gradient(180deg,#ffffff_0%,#fff8ef_100%)] before:bg-[#ff7a1a] hover:border-[#ffc98c] hover:bg-[linear-gradient(180deg,#fffaf4_0%,#fff4e8_100%)] hover:shadow-[0_18px_36px_rgba(255,122,26,0.12)]",
      title: "text-[#e85f00] group-hover/showcase:text-[#d94f00]",
      itemStroke: "group-hover/category:ring-2 group-hover/category:ring-[#ff7a1a]/45",
    },
    items: [
      { label: "Car Care", crop: "bg-[-1204px_-537px]" },
      { label: "Body Parts", crop: "bg-[-1554px_-325px]" },
      { label: "Battery", crop: "bg-[-1294px_-492px]" },
      { label: "Wiper Blade", crop: "bg-[-1164px_-248px]" },
    ],
  },
  {
    title: "PREMIUM TYRES",
    theme: {
      card: "border-[#dbe8ff] bg-[linear-gradient(180deg,#ffffff_0%,#f2f7ff_100%)] before:bg-[#1453a6] hover:border-[#b9d3ff] hover:bg-[linear-gradient(180deg,#fafdff_0%,#edf5ff_100%)] hover:shadow-[0_18px_36px_rgba(20,83,166,0.12)]",
      title: "text-[#1453a6] group-hover/showcase:text-[#1f315f]",
      itemStroke: "group-hover/category:ring-2 group-hover/category:ring-[#1453a6]/45",
    },
    items: [
      { label: "Car Tyre", crop: "bg-[-1452px_-548px]" },
      { label: "SUV Tyre", crop: "bg-[-1512px_-580px]" },
      { label: "Performance Tyre", crop: "bg-[-1390px_-530px]" },
      { label: "Rim Size", crop: "bg-[-1458px_-500px]" },
    ],
  },
  {
    title: "QUALITY LUBRICANTS",
    theme: {
      card: "border-[#d5f2e5] bg-[linear-gradient(180deg,#ffffff_0%,#f1fff8_100%)] before:bg-[#16a34a] hover:border-[#a9e8ca] hover:bg-[linear-gradient(180deg,#fbfffd_0%,#e8fff3_100%)] hover:shadow-[0_18px_36px_rgba(22,163,74,0.12)]",
      title: "text-[#128a41] group-hover/showcase:text-[#0f7a38]",
      itemStroke: "group-hover/category:ring-2 group-hover/category:ring-[#16a34a]/45",
    },
    items: [
      { label: "Engine Oil", crop: "bg-[-1335px_-334px]" },
      { label: "Transmission Fluid", crop: "bg-[-1200px_-432px]" },
      { label: "Coolant", crop: "bg-[-1274px_-390px]" },
      { label: "By Brand", crop: "bg-[-1368px_-283px]" },
    ],
  },
];

export const fallbackHeroCategorySlider = [
  { label: "Brake System", icon: "🛑", href: "#brake-system" },
  { label: "Engine Parts", icon: "⚙️", href: "#engine-parts" },
  { label: "Tyres", icon: "🚙", href: "#tyres" },
  { label: "Lubricants", icon: "🛢️", href: "#lubricants" },
  { label: "Electrical Parts", icon: "⚡", href: "#electrical-parts" },
  { label: "Car Care Items", icon: "🧴", href: "#car-care-items" },
  { label: "Body Parts", icon: "🚗", href: "#body-parts" },
  { label: "Filters", icon: "🧰", href: "#filters" },
  { label: "Battery", icon: "🔋", href: "#battery" },
  { label: "Accessories", icon: "🧩", href: "#accessories" },
];

function collectionHref(slug) {
  return `/collections/${encodeURIComponent(slug)}`;
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function imageForCategory(category) {
  return cleanText(category?.thumbnailUrl || category?.iconUrl, FALLBACK_IMAGE);
}

function normalizeCategory(category) {
  const slug = cleanText(category?.slug);

  return {
    id: cleanText(category?.id, slug),
    name: cleanText(category?.name),
    slug,
    description: cleanText(category?.description),
    thumbnailUrl: cleanText(category?.thumbnailUrl),
    iconUrl: cleanText(category?.iconUrl),
    imageUrl: imageForCategory(category),
    href: slug ? collectionHref(slug) : "/products",
    children: Array.isArray(category?.children) ? category.children.map(normalizeCategory).filter((child) => child.name && child.slug) : [],
  };
}

function normalizeFallbackHeroCategory(item) {
  return {
    id: cleanText(item?.href || item?.label),
    name: cleanText(item?.label),
    slug: cleanText(item?.href || item?.label).replace(/^#/, ""),
    description: "",
    thumbnailUrl: "",
    iconUrl: "",
    imageUrl: FALLBACK_IMAGE,
    icon: cleanText(item?.icon),
    href: cleanText(item?.href, "/category"),
    children: [],
  };
}

function normalizeFallbackShowcaseGroup(group) {
  return {
    title: cleanText(group?.title),
    theme: group?.theme || null,
    items: Array.isArray(group?.items)
      ? group.items.map((item) => ({
          label: cleanText(item?.label),
          name: cleanText(item?.label),
          slug: cleanText(item?.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          href: `#${cleanText(item?.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
          crop: cleanText(item?.crop),
          imageUrl: FALLBACK_IMAGE,
        }))
      : [],
  };
}

function buildTree(categories, parentId = null) {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      children: buildTree(categories, category.id),
    }));
}

function buildCategoryShowcase(categories) {
  return categories.slice(0, 4).map((category) => ({
    id: category.id,
    title: category.name.toUpperCase(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    href: category.href,
    imageUrl: category.imageUrl,
    thumbnailUrl: category.thumbnailUrl,
    iconUrl: category.iconUrl,
    children: category.children,
    items: category.children.slice(0, 4).map((child) => ({
      id: child.id,
      label: child.name,
      name: child.name,
      slug: child.slug,
      href: child.href,
      imageUrl: child.imageUrl,
      thumbnailUrl: child.thumbnailUrl,
      iconUrl: child.iconUrl,
    })),
  }));
}

function fallbackViewModel() {
  const heroSliderCategories = fallbackHeroCategorySlider.map(normalizeFallbackHeroCategory).filter((category) => category.name);
  const categoryShowcase = fallbackCategoryShowcase.map(normalizeFallbackShowcaseGroup).filter((group) => group.title);

  return {
    heroSliderCategories,
    categoryShowcase,
    featuredCategoryCards: heroSliderCategories.slice(0, 8),
    fallbackUsed: true,
  };
}

export async function getHomepageCategoryViewModel() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        iconUrl: true,
        parentId: true,
        sortOrder: true,
        isFeatured: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    const tree = buildTree(categories).map(normalizeCategory).filter((category) => category.name && category.slug);
    const featuredTree = buildTree(categories.filter((category) => category.isFeatured)).map(normalizeCategory).filter((category) => category.name && category.slug);
    const homepageCategories = featuredTree.length ? featuredTree : tree;

    if (!homepageCategories.length) return fallbackViewModel();

    return {
      heroSliderCategories: homepageCategories.slice(0, 12),
      categoryShowcase: buildCategoryShowcase(homepageCategories),
      featuredCategoryCards: homepageCategories,
      fallbackUsed: false,
    };
  } catch {
    return fallbackViewModel();
  }
}

export function getFallbackHomepageCategoryViewModel() {
  return fallbackViewModel();
}
