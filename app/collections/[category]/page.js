import ProductsPageClient from "../../products/ProductsPageClient";

export const metadata = {
  title: "Collection Products | JPSPARE",
  description: "Browse JPSPARE products by clean collection URL.",
};

function getValue(value, fallback = "") {
  return Array.isArray(value) ? value[0] || fallback : value || fallback;
}

function titleFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function CollectionCategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const category = getValue(resolvedParams?.category);
  const basePath = `/collections/${encodeURIComponent(category)}`;

  return (
    <ProductsPageClient
      basePath={basePath}
      lockedCategory
      title={`${titleFromSlug(category)} Collection`}
      initialFilters={{
        q: getValue(resolvedSearchParams?.q || resolvedSearchParams?.search),
        category,
        brand: getValue(resolvedSearchParams?.brand),
        sort: getValue(resolvedSearchParams?.sort, "newest"),
        page: getValue(resolvedSearchParams?.page, "1"),
      }}
    />
  );
}
