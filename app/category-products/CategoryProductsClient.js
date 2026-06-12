"use client";

import { useMemo, useState } from "react";
import CartDrawer from "../CartDrawer";
import { addProductToCart } from "../commerce-client";
import DynamicFilters, { deriveBrand, makeFacetOptions, priceRangeText } from "../DynamicFilters";
import ProductPagination from "../ProductPagination";
import ProductQuickActions from "../ProductQuickActions";
import { ProductCardInfo, tabData } from "../ProductTabs";

const pageCopy = {
  "CAR PARTS": {
    eyebrow: "Genuine Auto Parts",
    title: "Premium Car Parts",
    highlight: "Collection",
    description: "Browse authentic Japanese brake, electrical, engine, filter, suspension and body parts.",
  },
  TYRES: {
    eyebrow: "Premium Tyres",
    title: "Tyres And Wheel",
    highlight: "Selection",
    description: "Find car tyres, SUV tyres, tyre care products, pressure tools and rim-size matched options.",
  },
  LUBRICANT: {
    eyebrow: "Quality Lubricants",
    title: "Lubricant And Fluid",
    highlight: "Collection",
    description: "Shop engine oil, additives, transmission fluid and coolant with demo fitment-ready products.",
  },
};

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const PAGE_SIZE = 20;
const TOTAL_PAGES = 5;

function expandProducts(products, total = PAGE_SIZE * TOTAL_PAGES) {
  if (products.length === 0) {
    return [];
  }

  return Array.from({ length: total }, (_, index) => products[index % products.length]);
}

function ProductCard({ product, isAdded, onAdd, cardIndex }) {
  const productUrl = `/products/${slugify(product.name)}`;

  return (
    <article className="group/product rounded-[8px] border border-transparent bg-transparent p-2.5 transition duration-200 hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)]">
      <div className="relative -mx-2.5 -mt-2.5 overflow-hidden rounded-t-[8px]">
        <a
          href={productUrl}
          className={`block aspect-[10/11] rounded-t-[8px] rounded-b-none border border-[#eef0f3] bg-white bg-no-repeat transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.055] ${
            product.image ? "bg-contain bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
          }`}
          style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
          aria-label={product.name}
        />
        <ProductQuickActions productUrl={productUrl} productName={product.name} />
      </div>
      <ProductCardInfo product={product} productUrl={productUrl} onAdd={() => onAdd(product)} isAdded={isAdded} compact cardIndex={cardIndex} />
    </article>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" />
    </svg>
  );
}

export default function CategoryProductsClient({ categoryKey }) {
  const products = useMemo(() => tabData[categoryKey] || [], [categoryKey]);
  const copy = pageCopy[categoryKey] || pageCopy["CAR PARTS"];
  const filters = ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [addedItems, setAddedItems] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartProduct, setCartProduct] = useState(null);

  const brandOptions = useMemo(() => makeFacetOptions(products.map((product) => deriveBrand(product.name))), [products]);
  const productTypeOptions = useMemo(() => makeFacetOptions(products.map((product) => product.category)), [products]);
  const priceText = useMemo(() => priceRangeText(products), [products]);

  const filteredProducts = useMemo(() => {
    const matches = products.filter((product) => {
      const matchesFilter = activeFilter === "All" || product.category === activeFilter;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(deriveBrand(product.name));
      const matchesProductType = selectedProductTypes.length === 0 || selectedProductTypes.includes(product.category);
      return matchesFilter && matchesSearch && matchesBrand && matchesProductType;
    });

    return expandProducts(matches);
  }, [activeFilter, products, searchTerm, selectedBrands, selectedProductTypes]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredProducts]);

  async function handleAddToCart(product) {
    setAddedItems((items) => (items.includes(product.name) ? items : [...items, product.name]));
    setCartProduct(product);
    await addProductToCart(product);
  }

  function toggleSelected(setter, value) {
    setCurrentPage(1);
    setter((items) => (items.includes(value) ? items.filter((item) => item !== value) : [...items, value]));
  }

  return (
    <main className="bg-white">
      <section className="bg-[#f8f9fb] pt-16 pb-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[980px] text-center">
            <div className="inline-flex h-[44px] items-center gap-2 rounded-[10px] bg-[#ef3338] px-7 text-[14px] font-black uppercase tracking-[0.04em] text-white shadow-[0_14px_28px_rgba(220,38,38,0.24)]">
              <span>☆</span>
              {copy.eyebrow}
            </div>
            <h1 className="mt-8 text-[56px] font-black leading-none tracking-[-0.06em] text-[#111827] max-lg:text-[44px] max-sm:text-[34px]">
              {copy.title} <span className="text-[#df2026]">{copy.highlight}</span>
            </h1>
            <span className="mx-auto mt-7 block h-1 w-24 rounded-full bg-[#ef3338]" />
            <p className="mx-auto mt-6 max-w-[760px] text-[19px] leading-8 text-[#4b5563] max-sm:text-[15px]">{copy.description}</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-9 rounded-[14px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-[14px] font-black transition ${
                    activeFilter === filter
                      ? "border-[#ef3338] bg-[#ef3338] text-white shadow-[0_12px_24px_rgba(220,38,38,0.2)]"
                      : "border-[#ef3338]/30 bg-white text-[#263755] hover:border-[#ef3338] hover:bg-[#fff6f6] hover:text-[#df2026]"
                  }`}
                >
                  <FilterIcon />
                  {filter}
                </button>
              ))}
              <div className="ml-auto min-w-[260px] max-sm:ml-0 max-sm:w-full">
                <label className="sr-only" htmlFor={`${slugify(categoryKey)}-search`}>Search products</label>
                <input
                  id={`${slugify(categoryKey)}-search`}
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full rounded-full border border-[#d7dce4] px-5 text-[14px] font-semibold text-[#111827] outline-none transition placeholder:text-[#8b95a5] focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10"
                  placeholder={`Search ${categoryKey.toLowerCase()}`}
                />
              </div>
            </div>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[320px_1fr]">
            <DynamicFilters
              priceText={priceText}
              brands={brandOptions}
              productTypes={productTypeOptions}
              selectedBrands={selectedBrands}
              selectedProductTypes={selectedProductTypes}
              onToggleBrand={(value) => toggleSelected(setSelectedBrands, value)}
              onToggleProductType={(value) => toggleSelected(setSelectedProductTypes, value)}
            />

            <div className="grid grid-cols-6 gap-x-5 gap-y-9 max-2xl:grid-cols-5 max-xl:grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-y-6">
              {paginatedProducts.map((product, index) => (
                <ProductCard key={`${product.name}-${index}`} product={product} isAdded={addedItems.includes(product.name)} onAdd={() => handleAddToCart(product)} cardIndex={index} />
              ))}
            </div>
          </div>

          {filteredProducts.length > 0 && (
            <ProductPagination currentPage={currentPage} totalPages={TOTAL_PAGES} onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), TOTAL_PAGES))} />
          )}

          {filteredProducts.length === 0 && (
            <div className="rounded-[14px] border border-[#ffd9d9] bg-[#fff7f7] p-10 text-center">
              <h2 className="text-[24px] font-black text-[#111827]">No products found</h2>
              <p className="mt-2 text-[#4b5563]">Try another filter or search keyword.</p>
            </div>
          )}
        </div>
      </section>
      <CartDrawer product={cartProduct} open={Boolean(cartProduct)} onClose={() => setCartProduct(null)} />
    </main>
  );
}
