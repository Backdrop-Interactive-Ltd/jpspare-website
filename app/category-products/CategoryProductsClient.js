"use client";

import { useMemo, useState } from "react";
import { tabData } from "../ProductTabs";

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

function Stars({ count }) {
  if (!count) {
    return <div className="h-[18px]" />;
  }

  return (
    <div className="mt-[7px] flex items-center gap-1 text-[12px] leading-none">
      <span className="text-[15px] tracking-[-0.07em] text-[#009c91]">★★★★★</span>
      <span className="ml-1 text-[#111827]">{count} reviews</span>
    </div>
  );
}

function ProductCard({ product, isAdded, onAdd }) {
  return (
    <article className="group/product rounded-[10px] border border-transparent bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:bg-[#fffafa] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)]">
      <div className="relative overflow-hidden rounded-[6px]">
        <a
          href={`/products/${slugify(product.name)}`}
          className={`block aspect-square rounded-[6px] bg-white bg-no-repeat transition duration-200 group-hover/product:scale-[1.012] ${
            product.image ? "bg-cover bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
          }`}
          style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
          aria-label={product.name}
        />
        <button
          type="button"
          onClick={() => onAdd(product.name)}
          className="absolute bottom-9 left-1/2 z-10 flex h-[39px] min-w-[126px] -translate-x-1/2 translate-y-3 items-center justify-center rounded-full bg-black px-6 text-[13px] font-black text-white opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition duration-200 hover:bg-[#d3191d] group-hover/product:translate-y-0 group-hover/product:opacity-100 group-focus-within/product:translate-y-0 group-focus-within/product:opacity-100"
          aria-label={`Add ${product.name} to cart`}
        >
          {isAdded ? "Added" : "Add To Cart"}
        </button>
      </div>
      <div className="pt-[18px]">
        <p className="text-[11px] font-bold uppercase leading-none text-[#657792]">{product.category}</p>
        <h3 className="mt-[11px] min-h-[20px] truncate text-[15.5px] font-black leading-5 text-[#273955] transition group-hover/product:text-[#e12526]">
          <a href={`/products/${slugify(product.name)}`}>{product.name}</a>
        </h3>
        <Stars count={product.reviews} />
        <p className="mt-[12px] text-[18px] font-black leading-none text-[#ff5145]">{product.price}</p>
      </div>
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesFilter = activeFilter === "All" || product.category === activeFilter;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, products, searchTerm]);

  function handleAddToCart(productName) {
    setAddedItems((items) => (items.includes(productName) ? items : [...items, productName]));
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
                  onClick={() => setActiveFilter(filter)}
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
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-11 w-full rounded-full border border-[#d7dce4] px-5 text-[14px] font-semibold text-[#111827] outline-none transition placeholder:text-[#8b95a5] focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10"
                  placeholder={`Search ${categoryKey.toLowerCase()}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-x-[20px] gap-y-[44px] max-2xl:grid-cols-5 max-xl:grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {filteredProducts.map((product) => (
              <ProductCard key={product.name} product={product} isAdded={addedItems.includes(product.name)} onAdd={handleAddToCart} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-[14px] border border-[#ffd9d9] bg-[#fff7f7] p-10 text-center">
              <h2 className="text-[24px] font-black text-[#111827]">No products found</h2>
              <p className="mt-2 text-[#4b5563]">Try another filter or search keyword.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
