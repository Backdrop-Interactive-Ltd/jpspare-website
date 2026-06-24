"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addProductToCart, addProductToWishlist } from "../commerce-client";

const PRODUCT_COMPARE_SELECTION_KEY = "jpspare-product-compare-selection";
const PRODUCT_COMPARE_ITEMS_KEY = "jpspare-product-compare-items";

function parsePrice(value) {
  if (typeof value === "number") return value;
  const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function inferBrand(item) {
  if (item.brand?.name) return item.brand.name;
  if (item.brand) return item.brand;
  const title = item.title || item.name || "";
  const knownBrands = ["Liqui Moly", "Flamingo", "Kangaroo", "Philips", "Yesido", "Joyroom", "MOXOM", "Chevron", "TOKICO", "DENSO", "Mobil", "Brembo", "Michelin"];
  return knownBrands.find((brand) => title.toLowerCase().includes(brand.toLowerCase())) || "JPSPARE";
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
      .map((item, index) => {
        const title = item.title || item.name;
        return {
          id: item.key || item.slug || `compare-${index}`,
          productId: item.productId || item.id || null,
          slug: item.slug || item.key || "",
          rank: `0${index + 1}`,
          title,
          name: title,
          brand: inferBrand(item),
          price: parsePrice(item.price),
          regularPrice: parsePrice(item.regularPrice || item.oldPrice || item.compareAtPrice),
          partNumber: item.partNumber || item.sku || "N/A",
          category: item.category || "Auto Part",
          rating: Number(item.reviews || item.rating) || 4.8,
          availability: item.availability || "In Stock",
          description: item.description || "Selected product ready for side-by-side comparison.",
          image: item.image || item.thumbnail || "",
          crop: item.crop || "",
          freeDelivery: Boolean(item.freeDelivery || item.freeDeliveryEligible),
        };
      });
  } catch {
    return [];
  }
}

function writeCompareProducts(products) {
  if (typeof window === "undefined") return;

  const selection = products.map((product) => product.id).filter(Boolean);
  const items = products.map((product) => ({
    key: product.id,
    id: product.productId,
    slug: product.slug,
    title: product.title,
    name: product.title,
    brand: product.brand,
    price: product.price,
    regularPrice: product.regularPrice,
    category: product.category,
    image: product.image,
    crop: product.crop,
    reviews: product.rating,
    freeDelivery: product.freeDelivery,
    freeDeliveryEligible: product.freeDelivery,
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
    heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
    cart: "M6 6h15l-1.5 8.5H8L6 3H3m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    bolt: "m13 2-9 13h7l-1 7 9-13h-7l1-7Z",
    box: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.5 8.5 12 13l8.5-4.5M12 22v-9",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z",
    star: "m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.9-6.2-3.3L5.8 21 7 14.1l-5-4.8 6.9-1L12 2Z",
    check: "M20 6 9 17l-5-5",
    shield: "M12 3 19 6v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z",
    gauge: "M4 14a8 8 0 1 1 16 0M12 14l4-4M8 18h8",
    layers: "m12 3 9 5-9 5-9-5 9-5Zm-7 9 7 4 7-4M5 16l7 4 7-4",
    spark: "m13 2-2 7h7l-7 13 2-8H6l7-12Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function formatPrice(value) {
  return `৳${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function getDiscountPercent(price, regularPrice) {
  if (!regularPrice || regularPrice <= price) return null;
  return Math.round(((regularPrice - price) / regularPrice) * 100);
}

function ProductVisual({ product }) {
  if (product.image) {
    return <img src={product.image} alt={product.title} className="size-full object-cover transition duration-500 group-hover/card:scale-105" />;
  }

  return (
    <div
      className={`size-full bg-[url('/products-reference.png')] bg-[length:1460px_684px] bg-no-repeat ${product.crop || "bg-center"} transition duration-500 group-hover/card:scale-105`}
      aria-label={product.title}
      role="img"
    />
  );
}

function CompareProductCard({ product, added, onAdd, onRemove }) {
  const productHref = product.slug ? `/products/${product.slug}` : "/products";
  const discount = getDiscountPercent(product.price, product.regularPrice);

  return (
    <article className="group/card flex h-full min-h-[480px] flex-col overflow-hidden rounded-[8px] border border-[#e7ecf3] bg-white shadow-[0_20px_42px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#f7d95f] hover:shadow-[0_28px_56px_rgba(239,51,56,0.14)]">
      <div className="relative h-[288px] shrink-0 overflow-hidden bg-[#f6f8fb]">
        <ProductVisual product={product} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="grid size-9 place-items-center rounded-[8px] bg-[#ef3338] text-[12px] font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.24)]">{product.rank}</span>
          <button type="button" onClick={onRemove} className="grid size-9 place-items-center rounded-full border border-[#e5eaf1] bg-white/95 text-[#64748b] shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:border-[#ef3338] hover:bg-[#ef3338] hover:text-white" aria-label={`Remove ${product.title}`}>
            <Icon name="x" className="size-4" />
          </button>
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 overflow-hidden rounded-[8px] border border-[#e5eaf1] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.14)]">
          <Link href={productHref} className="grid size-10 place-items-center text-[#111827] transition hover:bg-[#fff1f1] hover:text-[#ef3338]" aria-label={`View ${product.title}`}>
            <Icon name="eye" className="size-[17px]" />
          </Link>
          <button type="button" onClick={() => addProductToWishlist(product)} className="grid size-10 place-items-center border-l border-[#edf1f6] text-[#111827] transition hover:bg-[#fff1f1] hover:text-[#ef3338]" aria-label={`Wishlist ${product.title}`}>
            <Icon name="heart" className="size-[17px]" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col bg-[#fffafa] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ef3338]">{product.category}</p>
        <Link href={productHref} className="product-card-title mt-2 block min-h-[46px] pr-12 line-clamp-2 text-[18px] leading-[1.25] !text-[#111827] transition hover:!text-[#ef3338]">
          {product.title}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2 pr-12">
          <span className="rounded-[6px] bg-[#f25a1d] px-2.5 py-1.5 text-[10px] font-black uppercase leading-none text-white shadow-[0_5px_12px_rgba(242,90,29,0.16)]">{product.brand}</span>
          {product.freeDelivery ? (
            <span className="rounded-[6px] bg-[#ff8a00] px-2.5 py-1.5 text-[10px] font-black leading-none text-white shadow-[0_5px_12px_rgba(255,138,0,0.16)]">Free Delivery</span>
          ) : null}
        </div>
        <div className="mt-5 flex items-end gap-2">
          <p className="product-price-display text-[28px] leading-none text-[#ef171d]">{formatPrice(product.price)}</p>
          {product.regularPrice ? <p className="product-price-old pb-1 text-[13px] leading-none text-[#9ca3af] line-through">{formatPrice(product.regularPrice)}</p> : null}
          {discount ? <span className="mb-0.5 rounded-[5px] bg-[#fff0e9] px-1.5 py-1 text-[9px] font-black leading-none text-[#ef3338]">-{discount}%</span> : null}
        </div>

        <div className="mt-auto grid grid-cols-[1fr_44px] gap-2 pt-4">
          <button type="button" onClick={onAdd} className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#ef3338] px-4 text-[16px] font-black text-white shadow-[0_14px_26px_rgba(239,51,56,0.20)] transition hover:bg-[#111827]">
            <Icon name="cart" className="size-4" />
            {added ? "Added" : "Add to Cart"}
          </button>
          <button type="button" onClick={() => addProductToWishlist(product)} className="grid h-12 place-items-center rounded-[8px] border border-[#e5e7eb] bg-white text-[#111827] transition hover:border-[#f7d95f] hover:bg-[#fffafa] hover:text-[#ef3338]" aria-label={`Wishlist ${product.title}`}>
            <Icon name="heart" className="size-[19px]" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ComparisonTable({ products }) {
  const tableGridStyle = {
    gridTemplateColumns: `220px repeat(${products.length}, minmax(220px, 1fr))`,
  };
  const rows = [
    { label: "Price", icon: "spark", render: (product) => <span className="product-price-display text-[22px] leading-none text-[#ef171d]">{formatPrice(product.price)}</span> },
    { label: "Regular Price", icon: "trend", render: (product) => product.regularPrice ? <span className="product-price-old text-[15px] text-[#9ca3af] line-through">{formatPrice(product.regularPrice)}</span> : <span className="text-[#9ca3af]">N/A</span> },
    { label: "Part Number", icon: "box", render: (product) => <span className="inline-block rounded-[7px] bg-[#f3f5f8] px-3 py-1.5 text-[13px] font-black text-[#667085]">{product.partNumber}</span> },
    { label: "Category", icon: "layers", render: (product) => <span className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-[12px] font-black uppercase text-[#059669]">{product.category}</span> },
    { label: "Brand", icon: "shield", render: (product) => <span className="text-[15px] font-black text-[#111827]">{product.brand}</span> },
    { label: "Rating", icon: "star", render: (product) => <span className="font-black text-[#111827]"><span className="mr-2 text-[#ff5b61]">★★★★★</span>{product.rating}</span> },
    { label: "Availability", icon: "check", render: (product) => <span className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-[12px] font-black text-[#059669]">✓ {product.availability}</span> },
    { label: "Description", icon: "gauge", render: (product) => <span className="block max-w-[340px] text-[14px] font-medium leading-6 text-[#4b5563]">{product.description}</span> },
  ];

  return (
    <section className="mt-10 overflow-hidden rounded-[8px] border border-[#e7ecf3] bg-white shadow-[0_24px_55px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden bg-[#111827] px-7 py-7 text-white">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_20%,rgba(239,51,56,0.34),transparent_42%)]" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white/80">
            <Icon name="trend" className="size-3.5 text-[#ef3338]" />
            Detailed Comparison
          </p>
          <h2 className="mt-3 text-[26px] font-black tracking-[-0.02em]">Specs, price and fitment side-by-side</h2>
          <p className="mt-2 max-w-[620px] text-[14px] font-medium leading-6 text-white/70">Quickly scan the differences before choosing the part that fits your vehicle and budget.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid border-b border-[#e8edf3] bg-[#f8fafc]" style={tableGridStyle}>
            <div className="px-6 py-5 text-[12px] font-black uppercase tracking-[0.18em] text-[#667085]">Features</div>
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-6 py-5">
                <div className="size-10 overflow-hidden rounded-[7px] bg-[#eef2f7]">
                  {product.image ? <img src={product.image} alt={product.title} className="size-full object-cover" /> : <div className="size-full bg-[url('/products-reference.png')] bg-cover bg-center" />}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-[13px] font-black uppercase text-[#111827]">{product.brand}</p>
                  <p className="line-clamp-1 text-[12px] font-semibold text-[#667085]">{product.title}</p>
                </div>
              </div>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid border-b border-[#edf1f6] transition last:border-b-0 hover:bg-[#fffafa]" style={tableGridStyle}>
              <div className="flex items-center gap-3 px-6 py-5 text-[14px] font-black text-[#111827]">
                <span className="grid size-7 place-items-center rounded-full bg-[#fff1f1] text-[#ef3338]">
                  <Icon name={row.icon} className="size-3.5" />
                </span>
                {row.label}
              </div>
              {products.map((product) => (
                <div key={`${product.id}-${row.label}`} className="px-6 py-5">
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

function EmptyState() {
  return (
    <section className="rounded-[8px] border border-[#e7ecf3] bg-white px-6 py-16 text-center shadow-[0_20px_44px_rgba(15,23,42,0.06)]">
      <span className="mx-auto grid size-16 place-items-center rounded-[14px] bg-[#fff1f1] text-[#ef3338]">
        <Icon name="layers" className="size-8" />
      </span>
      <h2 className="mt-6 text-[28px] font-black tracking-[-0.02em] text-[#111827]">No products selected</h2>
      <p className="mx-auto mt-3 max-w-[520px] text-[16px] font-medium leading-7 text-[#667085]">Add products from the homepage or product listing to compare price, stock, brand, and fitment details.</p>
      <Link href="/" className="group/empty-cta mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-[8px] !bg-[#ef3338] px-8 text-[15px] font-black !text-white shadow-[0_14px_26px_rgba(239,51,56,0.20)] transition-transform duration-200 hover:scale-[1.045] hover:!bg-[#ef3338] hover:!text-white active:scale-[0.985]">
        Continue Shopping
        <Icon name="arrowRight" className="size-4 transition-transform duration-200 group-hover/empty-cta:translate-x-1.5" />
      </Link>
    </section>
  );
}

export default function ComparePageClient() {
  const [products, setProducts] = useState([]);
  const [added, setAdded] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  const comparedText = useMemo(() => `${products.length}/3`, [products.length]);
  const lowestPrice = useMemo(() => products.reduce((lowest, product) => !lowest || product.price < lowest ? product.price : lowest, 0), [products]);
  const brands = useMemo(() => [...new Set(products.map((product) => product.brand).filter(Boolean))], [products]);

  useEffect(() => {
    const selectedProducts = readCompareProducts();
    setProducts(selectedProducts);
    setIsLoaded(true);
  }, []);

  const removeProduct = (productId) => {
    setProducts((current) => {
      const nextProducts = current.filter((product) => product.id !== productId);
      writeCompareProducts(nextProducts);
      return nextProducts;
    });
  };

  const clearProducts = () => {
    setProducts([]);
    setAdded({});
    writeCompareProducts([]);
  };

  const handleAdd = async (product) => {
    await addProductToCart(product, 1);
    setAdded((current) => ({ ...current, [product.id]: true }));
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8]">
      <section className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">
        {products.length > 0 ? (
        <div className="relative overflow-hidden rounded-[8px] border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] p-5 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_20%,rgba(239,51,56,0.10),transparent_34%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-black text-white/70 transition hover:text-[#ff5b61]">
                <Icon name="arrowLeft" className="size-4" />
                Back to Home
              </Link>
              <h1 className="mt-5 text-[36px] font-black leading-tight tracking-[-0.03em] text-white sm:text-[46px]">
                Product <span className="text-[#ff4a50]">Comparison</span>
              </h1>
              <p className="mt-3 max-w-[620px] text-[16px] font-medium leading-7 text-white/68">Compare selected JPSPARE products with a cleaner view of price, stock, brand, and fitment signals.</p>
            </div>

            <div className="grid min-w-[320px] grid-cols-2 gap-3">
              <div className="rounded-[8px] border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/58">Compared</p>
                <p className="mt-2 product-price-display text-[28px] leading-none text-white">{comparedText}</p>
              </div>
              <div className="rounded-[8px] border border-[#ff6b70]/25 bg-[#ef3338]/10 p-4 backdrop-blur-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/58">Lowest Price</p>
                <p className="mt-2 product-price-display text-[28px] leading-none text-[#ff5b61]">{lowestPrice ? formatPrice(lowestPrice) : "N/A"}</p>
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-[8px] border border-white/15 bg-black/20 p-4 text-white backdrop-blur-sm">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/60">Brands</p>
                  <p className="mt-1 line-clamp-1 text-[14px] font-black">{brands.length ? brands.join(" / ") : "No brand selected"}</p>
                </div>
                <button type="button" onClick={clearProducts} className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[13px] font-black text-[#111827] transition hover:bg-[#ef3338] hover:text-white">
                  <Icon name="x" className="size-4" />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
        ) : null}

        {!isLoaded ? null : products.length > 0 ? (
          <>
            <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <div key={product.id} className="h-full">
                  <CompareProductCard
                    product={product}
                    added={added[product.id]}
                    onAdd={() => handleAdd(product)}
                    onRemove={() => removeProduct(product.id)}
                  />
                </div>
              ))}
            </div>

            <ComparisonTable products={products} />

            <section className="group/decision mt-10 overflow-hidden rounded-[8px] border-2 border-transparent bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow] duration-300 hover:border-[#ffd7d9] hover:shadow-[0_22px_48px_rgba(255,159,164,0.42)]">
              <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                <div className="bg-white px-7 py-9 transition-colors duration-300 group-hover/decision:bg-[#fff1f1]">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ef3338]">Decision Support</p>
                  <h2 className="mt-3 text-[28px] font-black tracking-[-0.02em] text-[#111827]">Ready to make your choice?</h2>
                  <p className="mt-3 max-w-[680px] text-[15px] font-medium leading-7 text-[#667085]">Continue browsing authentic Japanese auto parts or call our experts for fitment help before checkout.</p>
                </div>
                <div className="flex flex-col justify-center gap-3 bg-[#111827] p-7">
                  <Link href="/" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#ef3338] px-6 text-[15px] font-black !text-white shadow-[0_10px_22px_rgba(239,51,56,0.18)] transition-transform duration-200 hover:scale-[1.035] active:scale-[0.985]">
                    <Icon name="box" className="size-4" />
                    Continue Shopping
                  </Link>
                  <a href="tel:09617226688" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/15 bg-white px-6 text-[15px] font-black !text-[#111827] transition-transform duration-200 hover:scale-[1.035] active:scale-[0.985]">
                    <Icon name="phone" className="size-4" />
                    Get Expert Help
                  </a>
                </div>
              </div>
            </section>
          </>
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}
