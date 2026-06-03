"use client";

import { useMemo, useState } from "react";
import CartDrawer from "../CartDrawer";
import { addProductToCart } from "../commerce-client";
import { ProductCardInfo } from "../ProductTabs";
import ProductQuickActions from "../ProductQuickActions";
import { searchCatalog } from "../../lib/searchCatalog";

function SearchProductCard({ product, isAdded, onAdd }) {
  const productUrl = `/products/${product.slug}`;

  return (
    <article className="group/product rounded-[10px] border border-transparent bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:bg-[#fffafa] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)]">
      <div className="relative overflow-hidden rounded-[6px]">
        <a
          href={productUrl}
          className={`block aspect-square rounded-[6px] bg-white bg-no-repeat transition duration-200 group-hover/product:scale-[1.012] ${
            product.image ? "bg-cover bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
          }`}
          style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
          aria-label={product.name}
        />
        <ProductQuickActions productUrl={productUrl} productName={product.name} />
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="absolute bottom-9 left-1/2 z-10 flex h-[39px] min-w-[126px] -translate-x-1/2 translate-y-3 items-center justify-center rounded-full bg-black px-6 text-[13px] font-black text-white opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition duration-200 hover:bg-[#d3191d] group-hover/product:translate-y-0 group-hover/product:opacity-100"
        >
          {isAdded ? "Added" : "Add To Cart"}
        </button>
      </div>
      <ProductCardInfo product={product} productUrl={productUrl} onAdd={() => onAdd(product)} isAdded={isAdded} />
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
            <div className="grid grid-cols-4 gap-x-[24px] gap-y-[44px] max-2xl:grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
              {products.map((product) => (
                <SearchProductCard key={product.slug} product={product} isAdded={addedItems.includes(product.name)} onAdd={handleAddToCart} />
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
