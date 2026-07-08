"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "../CartDrawer";
import ProductQuickActions from "../ProductQuickActions";
import { ProductCardInfo } from "../ProductTabs";
import { addProductToCart, addProductToWishlist } from "../commerce-client";

const PAGE_LIMIT = 12;

const brandFilterGroup = {
  title: "Brand",
  field: "brand",
  options: [
    ["Japan Parts", "japan-parts", "1"],
    ["Dreamz Drive International", "dreamz-drive-international", "7"],
    ["MICHELIN", "michelin", "9"],
    ["DENSO", "denso", "1"],
  ],
};

const fallbackCategoryOptions = [
  ["Car care Product", "car-care-product", "6"],
  ["Brush", "brush", "2"],
  ["Lubricant", "lubricant", "1"],
  ["AirFilter", "airfilter", "1"],
];

function flattenCategoryOptions(categories, depth = 0) {
  if (!Array.isArray(categories)) return [];

  return categories.flatMap((category) => {
    if (!category?.slug || !category?.name) return [];
    const children = flattenCategoryOptions(category.children, depth + 1);
    return [[`${"-- ".repeat(depth)}${category.name}`, category.slug, ""]].concat(children);
  });
}

function categoryFilterGroup(options) {
  return {
    title: "Category",
    field: "category",
    options: options.length ? options : fallbackCategoryOptions,
  };
}

function getProductImage(product) {
  return (
    product.images?.find((image) => image.isThumbnail)?.url ||
    product.images?.[0]?.url ||
    product.media?.[0]?.media?.url ||
    product.image ||
    "/jpspare-logo.png"
  );
}

function normalizeProduct(product) {
  return {
    ...product,
    name: product.name || product.title || "Untitled product",
    category: product.category?.name || product.category || "Auto Parts",
    image: getProductImage(product),
    oldPrice: product.oldPrice || product.regularPrice || product.compareAtPrice,
  };
}

function ProductCard({ product, cardIndex, onAdd, onWishlist }) {
  const productUrl = `/products/${product.slug}`;

  return (
    <article className="product-card-shell group/product relative rounded-[8px] border border-transparent bg-transparent p-2.5 transition duration-200">
      <div className="relative -mx-2.5 -mt-2.5 overflow-hidden rounded-t-[8px]">
        <a
          href={productUrl}
          className="block aspect-[10/11] rounded-t-[8px] rounded-b-none border border-[#eef0f3] bg-white bg-contain bg-center bg-no-repeat transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.055]"
          style={{ backgroundImage: `url(${product.image})` }}
          aria-label={product.name}
        />
        <ProductQuickActions productUrl={productUrl} productName={product.name} />
      </div>
      <ProductCardInfo
        product={product}
        productUrl={productUrl}
        onAdd={() => onAdd(product)}
        onWishlist={() => onWishlist(product)}
        compact
        cardIndex={cardIndex}
      />
    </article>
  );
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading products">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[10/11] rounded-[8px] bg-[#e9edf2]" />
          <div className="mt-4 h-3 w-2/5 rounded bg-[#e9edf2]" />
          <div className="mt-3 h-4 w-4/5 rounded bg-[#e9edf2]" />
          <div className="mt-8 h-6 w-1/3 rounded bg-[#e9edf2]" />
        </div>
      ))}
    </div>
  );
}

function ProductsPagination({ currentPage, totalPages, onPageChange }) {
  return (
    <nav className="mt-10 flex flex-col items-center justify-center gap-5" aria-label="Product pagination">
      <p className="text-[14px] font-semibold text-[#4b5563]">
        Page <strong className="text-[#111827]">{currentPage}</strong> of <strong className="text-[#111827]">{totalPages}</strong>
      </p>
      <div className="flex items-center justify-center gap-2 rounded-[14px] border border-[#edf0f3] bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-11 rounded-[8px] border border-[#dce2ea] bg-[#f8fafc] px-5 text-[14px] font-black text-[#98a2b3] transition hover:border-[#ef3338] hover:text-[#ef3338] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={[
            "grid size-11 place-items-center rounded-[8px] border text-[14px] font-black transition",
            page === currentPage
              ? "border-[#ef3338] bg-[#ef3338] text-white shadow-[0_12px_24px_rgba(239,51,56,0.24)]"
              : "border-[#dce2ea] bg-white text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]",
          ].join(" ")}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-11 rounded-[8px] bg-[#ef3338] px-5 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.20)] transition hover:bg-[#d91f25] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
      </div>
    </nav>
  );
}

export default function ProductsPageClient({ initialFilters, basePath = "/products", lockedCategory = false, title = "All Products" }) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    q: initialFilters.q || "",
    category: initialFilters.category || "",
    brand: initialFilters.brand || "",
    sort: initialFilters.sort || "newest",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(Math.max(1, Number.parseInt(initialFilters.page, 10) || 1));
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(fallbackCategoryOptions);

  const filterGroups = useMemo(() => [brandFilterGroup, categoryFilterGroup(categoryOptions)], [categoryOptions]);

  const requestQuery = useMemo(() => {
    const params = new URLSearchParams({ status: "ACTIVE", page: String(currentPage), limit: String(PAGE_LIMIT), sort: appliedFilters.sort });
    if (appliedFilters.q) params.set("q", appliedFilters.q);
    if (appliedFilters.category) params.set("category", appliedFilters.category);
    if (appliedFilters.brand) params.set("brand", appliedFilters.brand);
    return params.toString();
  }, [appliedFilters, currentPage]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/products?${requestQuery}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load products");
        setProducts((payload.items || payload.data || []).map(normalizeProduct));
        setPagination(payload.pagination || payload.meta || { page: currentPage, limit: PAGE_LIMIT, total: 0, totalPages: 1 });
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setProducts([]);
          setError(loadError.message || "Unable to load products");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [currentPage, requestQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories/tree", { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error("Unable to load categories");

        const options = flattenCategoryOptions(payload.items || payload.data);
        if (options.length) setCategoryOptions(options);
      } catch (loadError) {
        if (loadError.name !== "AbortError") setCategoryOptions(fallbackCategoryOptions);
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  function updateUrl(nextFilters, page = 1) {
    const params = new URLSearchParams();
    if (nextFilters.q) params.set("q", nextFilters.q);
    if (!lockedCategory && nextFilters.category) params.set("category", nextFilters.category);
    if (nextFilters.brand) params.set("brand", nextFilters.brand);
    if (nextFilters.sort !== "newest") params.set("sort", nextFilters.sort);
    if (page > 1) params.set("page", String(page));
    router.replace(params.size ? `${basePath}?${params}` : basePath, { scroll: false });
  }

  function applyFilters(event) {
    event.preventDefault();
    setAppliedFilters(filters);
    setCurrentPage(1);
    updateUrl(filters);
  }

  function clearFilters() {
    const nextFilters = { q: "", category: lockedCategory ? initialFilters.category || "" : "", brand: "", sort: "newest" };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setCurrentPage(1);
    updateUrl(nextFilters);
  }

  function changePage(page) {
    const nextPage = Math.min(Math.max(page, 1), pagination.totalPages);
    setCurrentPage(nextPage);
    updateUrl(appliedFilters, nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleAdd(product) {
    await addProductToCart(product);
    setCartOpen(true);
  }

  async function handleWishlist(product) {
    await addProductToWishlist(product);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-4 pb-16 pt-0 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-[1635px] border-t-[5px] border-[#ef3338] bg-white px-5 py-7 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:px-8">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ef3338]">JPSPARE Catalog</p>
        <h1 className="mt-2 text-[30px] font-black text-[#111827] sm:text-[38px]">{title}</h1>
        <p className="mt-2 text-[14px] font-medium text-[#64748b]">{pagination.total} products found</p>
      </section>

      <section className="mx-auto mt-10 grid w-full max-w-[1635px] gap-8 lg:grid-cols-[320px_1fr]">
        <form onSubmit={applyFilters} className="h-fit overflow-hidden rounded-[8px] border border-[#e1e7ef] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="bg-[linear-gradient(135deg,#111827,#6b3208)] p-6 text-white">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[22px] font-black">Smart Filters</h2>
              <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-black text-[#ffb5b8]">LIVE</span>
            </div>
            <p className="mt-8 text-[15px] font-medium leading-6 text-white/82">Find exactly what you need with focused product filters.</p>
          </div>
          <div className="space-y-4 p-5">
            <div className="rounded-[8px] border border-[#ffe08a] bg-[#fff9ef] p-4">
              <p className="flex items-center gap-2 text-[14px] font-black text-[#111827]"><span className="size-2 rounded-full bg-[#ef3338]" />Search</p>
              <input
                type="search"
                value={filters.q}
                onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                placeholder="Search products"
                className="mt-4 h-11 w-full rounded-[8px] border border-[#dce2ea] bg-white px-4 text-[14px] outline-none transition hover:border-[#ef3338] focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10"
              />
            </div>

            <div className="rounded-[8px] border border-[#ffe08a] bg-[#fff9ef] p-4">
              <p className="flex items-center gap-2 text-[14px] font-black text-[#111827]"><span className="size-2 rounded-full bg-[#ef3338]" />Price Range</p>
              <div className="mt-4 rounded-[8px] bg-[#f8fafc] p-3 text-center text-[12px] font-medium text-[#667085]">
                Range: ৳350.00 - ৳371000.00
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input placeholder="Min ৳350" className="h-10 min-w-0 rounded-[8px] border border-[#dce2ea] bg-white px-3 text-[13px] outline-none focus:border-[#ef3338]" />
                  <input placeholder="Max ৳371000" className="h-10 min-w-0 rounded-[8px] border border-[#dce2ea] bg-white px-3 text-[13px] outline-none focus:border-[#ef3338]" />
                </div>
              </div>
            </div>

            {filterGroups.map((group) => (
              <div key={group.title} className="rounded-[8px] border border-[#ffe08a] bg-[#fff9ef] p-4">
                <p className="flex items-center gap-2 text-[14px] font-black text-[#111827]"><span className="size-2 rounded-full bg-[#ef3338]" />{group.title}</p>
                <div className="mt-4 space-y-2">
                  {group.options.map(([label, value, count]) => {
                    const checked = filters[group.field] === value || filters[group.field] === label;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilters((current) => ({ ...current, [group.field]: checked ? "" : value }))}
                        className="flex w-full items-center justify-between gap-3 rounded-[8px] border border-[#dce2ea] bg-white px-3 py-2 text-left text-[13px] font-medium text-[#344054] transition hover:border-[#ef3338]"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`grid size-4 place-items-center rounded border ${checked ? "border-[#ef3338] bg-[#ef3338]" : "border-[#cbd5e1]"}`}>
                            {checked ? <span className="size-1.5 rounded-full bg-white" /> : null}
                          </span>
                          {label}
                        </span>
                        {count ? <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[12px] font-bold text-[#64748b]">{count}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <button type="submit" className="h-11 rounded-[8px] bg-[#ef3338] text-[14px] font-black text-white transition hover:bg-[#d91f25]">
                Apply
              </button>
              <button type="button" onClick={clearFilters} className="h-11 rounded-[8px] border border-[#dce2ea] bg-white text-[14px] font-black text-[#374151] transition hover:border-[#ef3338] hover:text-[#ef3338]">
                Clear
              </button>
            </div>
          </div>
        </form>

        <div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-[20px] font-medium text-[#4b5563]">
              <span className="text-[34px] font-black text-[#ef3338]">{products.length || pagination.total}</span> products found
            </p>
            <select
              value={filters.sort}
              onChange={(event) => {
                const nextFilters = { ...filters, sort: event.target.value };
                setFilters(nextFilters);
                setAppliedFilters(nextFilters);
                setCurrentPage(1);
                updateUrl(nextFilters);
              }}
              className="h-11 min-w-[190px] rounded-[8px] border border-[#dce2ea] bg-white px-4 text-[14px] font-medium outline-none transition hover:border-[#ef3338] focus:border-[#ef3338]"
            >
              <option value="newest">Best Selling</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div className="rounded-[8px] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          {loading ? <ProductsLoading /> : null}
          {!loading && error ? (
            <div className="rounded-[8px] border border-[#fecaca] bg-[#fff1f2] px-5 py-12 text-center text-[15px] font-bold text-[#b91c1c]">{error}</div>
          ) : null}
          {!loading && !error && products.length === 0 ? (
            <div className="rounded-[8px] border border-[#e5e7eb] bg-[#f8fafc] px-5 py-16 text-center">
              <h2 className="text-[20px] font-black text-[#111827]">No products found</h2>
              <p className="mt-2 text-[14px] text-[#64748b]">Try changing the search or filters.</p>
            </div>
          ) : null}
          {!loading && !error && products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <ProductCard key={product.id || product.slug} product={product} cardIndex={index} onAdd={handleAdd} onWishlist={handleWishlist} />
                ))}
              </div>
              {pagination.totalPages > 1 ? <ProductsPagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={changePage} /> : null}
            </>
          ) : null}
          </div>
        </div>
      </section>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}
