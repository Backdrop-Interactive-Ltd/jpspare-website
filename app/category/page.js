import Link from "next/link";
import { prisma } from "../../lib/db";
import { frontendCategoryBlueprint } from "../../lib/catalogBlueprint";
import TopDealBar from "../TopDealBar";
import { Header } from "../page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories | JPSPARE",
  description: "Browse JPSPARE automotive parts and accessories by category.",
};

const categoryImages = {
  "car-accessories": "/accessory-wide-angle-holder.jpeg",
  "car-parts": "/japanparts-reference.png",
  tyres: "/products-reference.png",
  lubricant: "/jpspare-hero-slide-3.jpg",
  "service-essentials": "/product-detail-reference.jpg",
};

function normalizeBlueprint() {
  return frontendCategoryBlueprint.map((category) => ({
    ...category,
    thumbnailUrl: categoryImages[category.slug],
    children: (category.children || []).map((child) => ({
      ...child,
      slug: child.slug,
      children: (child.children || []).map((name) => ({
        name,
        slug: String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      })),
    })),
  }));
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        iconUrl: true,
        _count: { select: { products: true, children: true } },
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnailUrl: true,
            iconUrl: true,
            _count: { select: { products: true, children: true } },
            children: {
              where: { isActive: true },
              orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return categories.length ? categories : normalizeBlueprint();
  } catch {
    return normalizeBlueprint();
  }
}

function categoryImage(category) {
  return category.thumbnailUrl || category.iconUrl || categoryImages[category.slug] || "/product-gallery-reference.png";
}

function categoryCount(category) {
  return category.children?.length || category._count?.children || category._count?.products || 0;
}

export default async function CategoryPage() {
  const categories = await getCategories();

  return (
    <>
      <TopDealBar />
      <Header />
      <main className="min-h-screen bg-white pb-16 text-[#111827]">
        <section className="border-b border-[#edf0f4] bg-white px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1760px] items-end justify-between gap-6 max-md:items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ef3338]">Browse Collection</p>
              <h1 className="mt-2 text-[32px] font-black leading-none tracking-[-0.04em] text-[#111827] max-sm:text-[27px]">
                Shop By Category
              </h1>
              <p className="mt-3 max-w-[650px] text-[13px] font-semibold leading-6 text-[#667085]">
                Find parts, accessories, tyres, lubricants, and service essentials from the complete JPSPARE catalog.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[6px] bg-[#ef3338] px-5 text-[12px] font-black text-white transition hover:bg-[#d3191d] max-sm:hidden"
            >
              All Products <span>→</span>
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-10 grid w-[calc(100%-40px)] max-w-[1760px] grid-cols-2 gap-x-16 gap-y-4 sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)] max-lg:grid-cols-1 max-lg:gap-y-3">
          {categories.map((category) => (
            <Link
              key={category.id || category.slug}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group/category grid min-h-[154px] grid-cols-[minmax(0,1fr)_205px] overflow-hidden bg-white max-sm:min-h-[116px] max-sm:grid-cols-[minmax(0,1fr)_116px]"
            >
              <div
                className="relative flex flex-col justify-center overflow-hidden bg-[#111827] px-8 py-6 text-white transition-colors duration-300 group-hover/category:bg-[#d91f26] max-sm:px-5 max-sm:py-4"
                style={{ clipPath: "polygon(0 0, 100% 0, 86% 100%, 0 100%)" }}
              >
                <span className="absolute inset-y-0 left-0 w-2 bg-[#ef3338] transition-colors group-hover/category:bg-[#f7d95f]" />
                <div className="relative z-10">
                  <h2 className="text-[28px] font-black leading-tight tracking-[-0.035em] max-sm:text-[19px]">{category.name}</h2>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.04em] text-white/80 max-sm:text-[9px]">
                    {categoryCount(category)} Types
                  </p>
                </div>
                <span className="pointer-events-none absolute bottom-5 left-8 h-[2px] w-0 bg-[#f7d95f] transition-all duration-300 group-hover/category:w-14 max-sm:left-5" />
              </div>

              <div className="relative flex items-center justify-center overflow-hidden bg-white">
                <img
                  src={categoryImage(category)}
                  alt=""
                  className="h-[138px] w-full object-contain p-1 transition duration-500 group-hover/category:scale-[1.07] max-sm:h-[106px]"
                />
              </div>
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
