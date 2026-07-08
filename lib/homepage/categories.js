import { prisma } from "../db";
import { categoryShowcase as fallbackCategoryShowcase, heroCategorySlider as fallbackHeroCategorySlider } from "../../app/homepage/homepage-data";

const FALLBACK_IMAGE = "/japanparts-reference.png";

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
