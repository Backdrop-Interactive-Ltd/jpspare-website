"use client";

import { useMemo, useState } from "react";
import CartDrawer from "../CartDrawer";
import { addProductToCart } from "../commerce-client";
import { ProductCardInfo } from "../ProductTabs";
import ProductQuickActions from "../ProductQuickActions";
import { searchCatalog } from "../../lib/searchCatalog";

function SearchProductCard({ product, isAdded, onAdd, cardIndex }) {
  const productUrl = `/products/${product.slug}`;

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

export default function SearchResultsClient({ query }) {
  const [addedItems, setAddedItems] = useState([]);
  const [cartProduct, setCartProduct] = useState(null);
  const products = useMemo(() => searchCatalog(query), [query]);

  async function handleAddToCart(product) {
    setAddedItems((items) => (items.includes(product.name) ? items : [...items, product.name]));
    setCartProduct(product);
    await addProductToCart(product);
  }

  return (
    <main className="bg-white">
      <section className="bg-[#f8f9fb] pt-14 pb-10">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-[860px]">
            <div className="inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-[#ef3338] px-5 text-[13px] font-black uppercase tracking-[0.04em] text-white">
              Search Results
            </div>
            <h1 className="mt-6 text-[44px] font-black leading-tight tracking-[-0.04em] text-[#111827] max-sm:text-[30px]">
              {query ? <>Products for <span className="text-[#ef3338]">&quot;{query}&quot;</span></> : "Search Products"}
            </h1>
            <p className="mt-3 text-[16px] font-semibold text-[#667085]">
              {products.length ? `${products.length} matching product${products.length === 1 ? "" : "s"} found.` : "No matching products found."}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          {products.length ? (
            <div className="grid grid-cols-6 gap-x-5 gap-y-9 max-2xl:grid-cols-5 max-xl:grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-y-6">
              {products.map((product, index) => (
                <SearchProductCard key={product.slug} product={product} isAdded={addedItems.includes(product.name)} onAdd={handleAddToCart} cardIndex={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-[#ffd9d9] bg-[#fff7f7] p-10 text-center">
              <h2 className="text-[24px] font-black text-[#111827]">No products found</h2>
              <p className="mt-2 text-[#4b5563]">Try another product name or category keyword.</p>
            </div>
          )}
        </div>
      </section>

      <CartDrawer product={cartProduct} onClose={() => setCartProduct(null)} />
    </main>
  );
}
