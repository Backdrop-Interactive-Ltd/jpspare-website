"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "../CartDrawer";
import ProductQuickActions from "../ProductQuickActions";
import { ProductCardInfo } from "../ProductTabs";
import { addProductToCart, addProductToWishlist } from "../commerce-client";

const PAGE_LIMIT = 24;

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
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" aria-label="Loading products">
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
    <nav className="mt-14 flex items-center justify-center gap-3" aria-label="Product pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-10 rounded-[7px] border border-[#dce2ea] bg-white px-5 text-[14px] font-black text-[#374151] transition hover:border-[#f7d95f] hover:text-[#ef3338] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <span className="min-w-[110px] text-center text-[14px] font-bold text-[#64748b]">
        Page <strong className="text-[#111827]">{currentPage}</strong> of <strong className="text-[#111827]">{totalPages}</strong>
      </span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-10 rounded-[7px] bg-[#ef3338] px-5 text-[14px] font-black text-white transition hover:bg-[#d91f25] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}

export default function ProductsPageClient({ initialFilters }) {
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

  function updateUrl(nextFilters, page = 1) {
    const params = new URLSearchParams();
    if (nextFilters.q) params.set("q", nextFilters.q);
    if (nextFilters.category) params.set("category", nextFilters.category);
    if (nextFilters.brand) params.set("brand", nextFilters.brand);
    if (nextFilters.sort !== "newest") params.set("sort", nextFilters.sort);
    if (page > 1) params.set("page", String(page));
    router.replace(params.size ? `/products?${params}` : "/products", { scroll: false });
  }

  function applyFilters(event) {
    event.preventDefault();
    setAppliedFilters(filters);
    setCurrentPage(1);
    updateUrl(filters);
  }

  function clearFilters() {
    const nextFilters = { q: "", category: "", brand: "", sort: "newest" };
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
    <main className="min-h-screen bg-[#f2f4f7] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1720px] rounded-[8px] bg-white px-5 py-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ef3338]">JPSPARE Catalog</p>
            <h1 className="mt-2 text-[30px] font-black text-[#111827] sm:text-[38px]">All Products</h1>
            <p className="mt-2 text-[14px] text-[#64748b]">{pagination.total} products available</p>
          </div>
        </div>

        <form onSubmit={applyFilters} className="mt-8 grid gap-3 rounded-[8px] border border-[#e5e7eb] bg-[#f8fafc] p-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto_auto]">
          <input
            type="search"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="Search products"
            className="h-11 min-w-0 rounded-[7px] border border-[#dce2ea] bg-white px-4 text-[14px] outline-none transition hover:border-[#f7d95f] focus:border-[#ef3338]"
          />
          <input
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            placeholder="Category slug or name"
            className="h-11 min-w-0 rounded-[7px] border border-[#dce2ea] bg-white px-4 text-[14px] outline-none transition hover:border-[#f7d95f] focus:border-[#ef3338]"
          />
          <input
            value={filters.brand}
            onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}
            placeholder="Brand slug or name"
            className="h-11 min-w-0 rounded-[7px] border border-[#dce2ea] bg-white px-4 text-[14px] outline-none transition hover:border-[#f7d95f] focus:border-[#ef3338]"
          />
          <select
            value={filters.sort}
            onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
            className="h-11 min-w-0 rounded-[7px] border border-[#dce2ea] bg-white px-4 text-[14px] outline-none transition hover:border-[#f7d95f] focus:border-[#ef3338]"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          <button type="submit" className="h-11 rounded-[7px] bg-[#ef3338] px-6 text-[14px] font-black text-white transition hover:bg-[#d91f25]">
            Apply
          </button>
          <button type="button" onClick={clearFilters} className="h-11 rounded-[7px] border border-[#dce2ea] bg-white px-5 text-[14px] font-black text-[#374151] transition hover:border-[#f7d95f] hover:text-[#ef3338]">
            Clear
          </button>
        </form>

        <div className="mt-10">
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
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id || product.slug} product={product} cardIndex={index} onAdd={handleAdd} onWishlist={handleWishlist} />
                ))}
              </div>
              {pagination.totalPages > 1 ? <ProductsPagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={changePage} /> : null}
            </>
          ) : null}
        </div>
      </section>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}
