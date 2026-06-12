"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PRODUCT_COMPARE_SELECTION_KEY = "jpspare-product-compare-selection";
const PRODUCT_COMPARE_ITEMS_KEY = "jpspare-product-compare-items";

function parsePrice(value) {
  if (typeof value === "number") return value;
  const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function readCompareProducts() {
  if (typeof window === "undefined") return [];

  try {
    const storedItems = window.localStorage.getItem(PRODUCT_COMPARE_ITEMS_KEY);
    const parsedItems = storedItems ? JSON.parse(storedItems) : [];
    if (!Array.isArray(parsedItems)) return [];

    return parsedItems
      .filter((item) => item && (item.name || item.title))
      .slice(0, 3)
      .map((item, index) => ({
        id: item.key || item.slug || `compare-${index}`,
        slug: item.slug || item.key || "",
        rank: `#${index + 1}`,
        title: item.title || item.name,
        brand: item.brand || "JPSPARE",
        price: parsePrice(item.price),
        partNumber: item.partNumber || "N/A",
        category: item.category || "Auto Part",
        rating: Number(item.reviews || item.rating) || 4.5,
        availability: item.availability || "In Stock",
        description: item.description || "Selected product ready for side-by-side comparison.",
        image: item.image || "",
        crop: item.crop || "",
      }));
  } catch {
    return [];
  }
}

function writeCompareProducts(products) {
  if (typeof window === "undefined") return;

  const selection = products.map((product) => product.id).filter(Boolean);
  const items = products.map((product) => ({
    key: product.id,
    slug: product.slug,
    title: product.title,
    name: product.title,
    brand: product.brand,
    price: product.price,
    category: product.category,
    image: product.image,
    crop: product.crop,
    reviews: product.rating,
  }));

  window.localStorage.setItem(PRODUCT_COMPARE_SELECTION_KEY, JSON.stringify(selection));
  window.localStorage.setItem(PRODUCT_COMPARE_ITEMS_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("jpspare-compare-change", { detail: { count: selection.length } }));
}

function Icon({ name, className = "size-4" }) {
  const icons = {
    arrowLeft: "M19 12H5m7-7-7 7 7 7",
    arrowRight: "M5 12h14m-7-7 7 7-7 7",
    trend: "m4 17 6-6 4 4 6-8M15 7h5v5",
    x: "M18 6 6 18M6 6l12 12",
    eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    bolt: "m13 2-9 13h7l-1 7 9-13h-7l1-7Z",
    box: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.5 8.5 12 13l8.5-4.5M12 22v-9",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z",
    star: "m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.9-6.2-3.3L5.8 21 7 14.1l-5-4.8 6.9-1L12 2Z",
    check: "M20 6 9 17l-5-5",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function formatPrice(value) {
  return `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CompareProductCard({ product, quantity, added, onAdd, onRemove, onQuantity }) {
  const productHref = product.slug ? `/products/${product.slug}` : "/products";

  return (
    <article className="overflow-hidden rounded-[12px] border border-[#edf0f4] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.10)]">
      <div className="relative h-[250px] overflow-hidden bg-[#f8fafc]">
        <div
          className={`h-full w-full bg-no-repeat ${product.image ? "bg-contain bg-center" : `bg-[url('/products-reference.png')] bg-[length:1460px_684px] ${product.crop}`}`}
          style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
        />
        <span className="absolute left-4 top-4 rounded-full bg-[#ef3338] px-3 py-2 text-[13px] font-black text-white shadow-lg">{product.rank}</span>
        <span className="absolute left-16 top-4 rounded-full bg-[#22c55e] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white">In Stock</span>
        <button type="button" onClick={onRemove} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-[#e5e7eb] bg-white text-[#64748b] shadow-lg transition hover:border-[#ef3338] hover:text-[#ef3338]" aria-label={`Remove ${product.title}`}>
          <Icon name="x" className="size-4" />
        </button>
        <div className="absolute bottom-4 left-4 flex overflow-hidden rounded-[6px] border border-[#e5e7eb] bg-white shadow-lg">
          <Link href={productHref} className="grid size-10 place-items-center text-[#475467] transition hover:bg-[#fff5f5] hover:text-[#ef3338]" aria-label={`View ${product.title}`}>
            <Icon name="eye" className="size-[17px]" />
          </Link>
          <button type="button" className="grid size-10 place-items-center border-l border-[#edf0f3] text-[#475467] transition hover:bg-[#fff5f5] hover:text-[#ef3338]" aria-label={`Wishlist ${product.title}`}>
            <Icon name="heart" className="size-[17px]" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="mb-2 flex justify-end">
            <span className="rounded-[6px] border border-[#e5e7eb] bg-[#f8fafc] px-2 py-1 text-[11px] font-bold text-[#64748b]">{product.brand}</span>
          </div>
          <h2 className="line-clamp-2 text-[17px] font-black text-[#172033]">{product.title}</h2>
          <p className="mt-3 text-[22px] font-black text-[#ef3338]">{formatPrice(product.price)}</p>
        </div>

        <div className="flex items-center justify-center gap-3 rounded-[8px] bg-[#f8fafc] p-3">
          <span className="text-[12px] font-bold text-[#667085]">Qty:</span>
          <button type="button" onClick={() => onQuantity(-1)} className="grid size-9 place-items-center rounded-[6px] border border-[#d8dee6] bg-white text-lg font-bold text-[#98a2b3] transition hover:border-[#ef3338] hover:text-[#ef3338]" aria-label={`Decrease ${product.title}`}>
            -
          </button>
          <span className="min-w-6 text-center text-[16px] font-black text-[#172033]">{quantity}</span>
          <button type="button" onClick={() => onQuantity(1)} className="grid size-9 place-items-center rounded-[6px] border border-[#d8dee6] bg-white text-lg font-bold text-[#98a2b3] transition hover:border-[#ef3338] hover:text-[#ef3338]" aria-label={`Increase ${product.title}`}>
            +
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onAdd} className="flex items-center justify-center gap-2 rounded-[6px] bg-[#111827] px-4 py-3 text-[14px] font-black text-white transition hover:bg-[#ef3338]">
            <Icon name="cart" className="size-4" />
            {added ? "Added" : "Add"}
          </button>
          <button type="button" className="flex items-center justify-center gap-2 rounded-[6px] bg-[#df171d] px-4 py-3 text-[14px] font-black text-white transition hover:bg-[#111827]">
            <Icon name="bolt" className="size-4" />
            Buy
          </button>
        </div>
      </div>
    </article>
  );
}

function StatCard({ product }) {
  return (
    <div className="grid grid-cols-2 rounded-[10px] border border-[#edf0f4] bg-white px-8 py-5 shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
      <div>
        <p className="flex items-center gap-2 text-[13px] font-black text-[#172033]">
          <Icon name="star" className="size-4 text-[#ef3338]" />
          Rating
        </p>
        <p className="mt-1 text-[18px] font-black text-[#ef3338]">{product.rating}</p>
      </div>
      <div>
        <p className="flex items-center gap-2 text-[13px] font-black text-[#172033]">
          <Icon name="check" className="size-4 text-[#10b981]" />
          Stock
        </p>
        <p className="mt-1 text-[14px] font-black text-[#059669]">{product.availability}</p>
      </div>
    </div>
  );
}

function ComparisonTable({ products }) {
  const tableGridStyle = {
    gridTemplateColumns: `240px repeat(${products.length}, minmax(0, 1fr))`,
  };
  const rows = [
    { label: "Price", dot: "bg-[#ef3338]", render: (product) => <span className="text-[20px] font-black text-[#ef3338]">{formatPrice(product.price)}</span> },
    { label: "Part Number", dot: "bg-[#3b82f6]", render: (product) => <span className="inline-block w-full rounded-[6px] bg-[#f3f5f8] px-3 py-1 text-[13px] font-bold text-[#667085]">{product.partNumber}</span> },
    { label: "Category", dot: "bg-[#10b981]", render: (product) => <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-[12px] font-bold text-[#059669]">{product.category}</span> },
    { label: "Brand", dot: "bg-[#a855f7]", render: (product) => <span className="font-black text-[#172033]">{product.brand}</span> },
    { label: "Rating", dot: "bg-[#ef4444]", render: (product) => <span className="font-bold text-[#172033]"><span className="mr-2 text-[#ff5b61]">★★★★☆</span>{product.rating}</span> },
    { label: "Availability", dot: "bg-[#10b981]", render: (product) => <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-[12px] font-bold text-[#059669]">✓ {product.availability}</span> },
    { label: "Description", dot: "bg-[#64748b]", render: (product) => <span className="block max-w-[320px] text-[14px] leading-6 text-[#4b5563]">{product.description}</span> },
  ];

  return (
    <section className="mt-14 overflow-hidden rounded-[12px] bg-white shadow-[0_22px_45px_rgba(15,23,42,0.10)]">
      <div className="bg-gradient-to-r from-[#ff4b4f] to-[#df171d] px-8 py-7 text-white">
        <h2 className="flex items-center gap-3 text-[22px] font-black">
          <Icon name="trend" className="size-5" />
          Detailed Comparison
        </h2>
        <p className="mt-4 text-[15px] text-white/85">Side-by-side comparison of specifications and features</p>
      </div>

      <div className="min-w-full overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid border-b border-[#e8edf3] bg-[#f8fafc]" style={tableGridStyle}>
            <div className="px-8 py-5 text-[13px] font-black uppercase tracking-wide text-[#172033]">Features</div>
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-2 px-8 py-5 text-[13px] font-black uppercase tracking-wide text-[#172033]">
                <Icon name="box" className="size-4 text-[#ef3338]" />
                {product.brand} Brake
              </div>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid border-b border-[#edf0f4] last:border-b-0" style={tableGridStyle}>
              <div className="flex items-center gap-3 px-8 py-6 text-[14px] font-black text-[#172033]">
                <span className={`size-2 rounded-full ${row.dot}`} />
                {row.label}
              </div>
              {products.map((product) => (
                <div key={`${product.id}-${row.label}`} className="px-8 py-6">
                  {row.render(product)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ComparePageClient() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [added, setAdded] = useState({});

  const comparedText = useMemo(() => `${products.length}/3`, [products.length]);

  useEffect(() => {
    const selectedProducts = readCompareProducts();
    setProducts(selectedProducts);
    setQuantities(Object.fromEntries(selectedProducts.map((product) => [product.id, 1])));
  }, []);

  const updateQuantity = (productId, delta) => {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(1, (current[productId] || 1) + delta),
    }));
  };

  const removeProduct = (productId) => {
    setProducts((current) => {
      const nextProducts = current.filter((product) => product.id !== productId);
      writeCompareProducts(nextProducts);
      return nextProducts;
    });
  };

  const clearProducts = () => {
    setProducts([]);
    setQuantities({});
    setAdded({});
    writeCompareProducts([]);
  };

  return (
    <main className="min-h-screen bg-[#fbfcfd]">
      <section className="mx-auto w-full max-w-[1120px] px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[15px] font-medium text-[#667085] transition hover:text-[#ef3338]">
          <Icon name="arrowLeft" className="size-4" />
          Back to Home
        </Link>

        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[38px] font-black leading-tight tracking-[-0.02em] text-[#172033] sm:text-[44px]">
              Product <span className="text-[#ef3338]">Comparison</span>
            </h1>
            <p className="mt-3 text-[17px] text-[#667085]">Comparing {products.length} of 3 products • Find the perfect auto part</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-3 rounded-[8px] bg-white px-5 py-3 text-[13px] font-bold text-[#667085] shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
              <Icon name="trend" className="size-4 text-[#ef3338]" />
              <strong className="text-[#172033]">{comparedText}</strong>
              compared
            </span>
            <button type="button" onClick={clearProducts} className="inline-flex items-center gap-3 rounded-[8px] bg-white px-5 py-3 text-[13px] font-bold text-[#667085] shadow-[0_10px_24px_rgba(15,23,42,0.10)] transition hover:text-[#ef3338]">
              <Icon name="x" className="size-4" />
              Clear All
            </button>
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {products.map((product) => (
                <div key={product.id} className="space-y-5">
                  <CompareProductCard
                    product={product}
                    quantity={quantities[product.id] || 1}
                    added={added[product.id]}
                    onAdd={() => setAdded((current) => ({ ...current, [product.id]: true }))}
                    onRemove={() => removeProduct(product.id)}
                    onQuantity={(delta) => updateQuantity(product.id, delta)}
                  />
                  <StatCard product={product} />
                </div>
              ))}
            </div>

            <ComparisonTable products={products} />

            <section className="mt-14 rounded-[12px] border border-[#ffe1e1] bg-[#fff0f0] px-6 py-12 text-center">
              <h2 className="text-[27px] font-black text-[#172033]">Ready to make your choice?</h2>
              <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-7 text-[#667085]">Continue browsing our extensive collection of authentic Japanese auto parts or contact our experts for personalized recommendations.</p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#df171d] px-8 py-4 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(239,51,56,0.20)] transition hover:bg-[#111827]">
                  <Icon name="box" className="size-4" />
                  Continue Shopping
                </Link>
                <a href="tel:01718914582" className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#d8dee6] bg-white px-8 py-4 text-[15px] font-black text-[#475467] transition hover:border-[#ef3338] hover:text-[#ef3338]">
                  <Icon name="phone" className="size-4" />
                  Get Expert Help
                </a>
              </div>
            </section>
          </>
        ) : (
          <section className="mt-14 rounded-[12px] border border-[#edf0f4] bg-white px-6 py-16 text-center shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
            <h2 className="text-[28px] font-black text-[#172033]">No products selected</h2>
            <p className="mt-3 text-[#667085]">Add products again to compare specs, pricing, stock, and fitment details.</p>
            <Link href="/" className="mt-8 inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#df171d] px-8 py-4 text-[15px] font-black text-white transition hover:bg-[#111827]">
              Continue Shopping
              <Icon name="arrowRight" className="size-4" />
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}
