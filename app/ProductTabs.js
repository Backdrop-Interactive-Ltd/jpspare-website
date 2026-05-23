"use client";

import { useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";
import { addProductToCart } from "./commerce-client";
import ProductQuickActions from "./ProductQuickActions";

const productImages = {
  washer: "bg-[-268px_-22px]",
  acCleaner: "bg-[-618px_-28px]",
  fuelCleaner: "bg-[-968px_-28px]",
  engineFlush: "bg-[-1318px_-37px]",
  perfumeAqua: "bg-[-268px_-507px]",
  blackIce: "bg-[-618px_-506px]",
  romance: "bg-[-968px_-506px]",
  battery: "bg-[-1318px_-506px]",
};

export const tabData = {
  "CAR ACCESSORIES": [
    { category: "CAR CARE DETAILING", name: "Flamingo AC Pro Air Conditioner Cleaner", price: "Tk 650.00", reviews: 4, image: "/accessory-ac-pro.jpeg" },
    { category: "CAR CARE DETAILING", name: "Flamingo Windshield Washer Fluid", price: "Tk 480.00", reviews: 6, image: "/accessory-windshield-washer.jpeg" },
    { category: "PERFUME AIR FRESHENER", name: "Flamingo Lemon Air Freshener Spray", price: "Tk 390.00", reviews: 5, image: "/accessory-air-freshener-yellow.jpeg" },
    { category: "CAR CARE DETAILING", name: "Flamingo Premium Hard Wax", price: "Tk 950.00", reviews: 7, image: "/accessory-hard-wax.jpeg" },
    { category: "CAR WASH", name: "Kangaroo Car Shampoo 650ml", price: "Tk 720.00", reviews: 8, image: "/accessory-car-shampoo.jpeg" },
    { category: "PHONE ACCESSORIES", name: "MOXOM Wide-Angle Rotating Car Holder", price: "Tk 1,250.00", reviews: 5, image: "/accessory-wide-angle-holder.jpeg" },
    { category: "PERFUME AIR FRESHENER", name: "Luxe Badee Al Oud Air Freshener", price: "Tk 1,150.00", reviews: 6, image: "/accessory-luxe-air-freshener.jpeg" },
    { category: "PHONE ACCESSORIES", name: "Joyroom Suction Car Phone Holder", price: "Tk 1,450.00", reviews: 4, image: "/accessory-joyroom-holder.jpeg" },
    { category: "PHONE ACCESSORIES", name: "Yesido Wireless Holder 15W C197", price: "Tk 1,850.00", reviews: 5, image: "/accessory-yesido-wireless-holder.jpeg" },
    { category: "PHONE ACCESSORIES", name: "Yesido C267 Suction Windshield Holder", price: "Tk 1,650.00", reviews: 5, image: "/accessory-yesido-car-holder.jpeg" },
  ],
  "CAR PARTS": [
    { category: "BRAKE SYSTEM", name: "Premium Ceramic Brake Pad Set Toyota", price: "Tk 4,850.00", reviews: 7, crop: productImages.washer },
    { category: "ELECTRICAL PARTS", name: "Japanese LED Head Light Set Assembly", price: "Tk 18,500.00", reviews: 4, crop: productImages.battery },
    { category: "ENGINE PARTS", name: "OEM Grade Spark Plug Set For Japanese Car", price: "Tk 1,850.00", reviews: 9, crop: productImages.blackIce },
    { category: "FILTER", name: "Premium Engine Air Filter Replacement", price: "Tk 1,250.00", reviews: 5, crop: productImages.acCleaner },
    { category: "SUSPENSION", name: "Front Shock Absorber Pair Premio", price: "Tk 11,900.00", reviews: 3, crop: productImages.fuelCleaner },
    { category: "BODY PARTS", name: "Replacement Side Mirror Cover Black", price: "Tk 2,200.00", reviews: 2, crop: productImages.romance },
    { category: "BATTERY", name: "Philips CR1632 3V 260mAh Car Key Fob R...", price: "Tk 450.00", reviews: 6, crop: productImages.battery },
    { category: "WIPER BLADE", name: "High Performance Wiper Blade Set", price: "Tk 1,100.00", reviews: 4, crop: productImages.washer },
    { category: "BRAKE SYSTEM", name: "TOKICO Front Shock Absorber B3337", price: "Tk 4,680.00", reviews: 5, crop: productImages.engineFlush },
    { category: "ENGINE PARTS", name: "DENSO Ignition Coil Japanese OEM", price: "Tk 6,250.00", reviews: 6, crop: productImages.fuelCleaner },
  ],
  TYRES: [
    { category: "CAR TYRE", name: "Premium All Season Car Tyre 15 Inch", price: "Tk 12,400.00", reviews: 5, crop: productImages.engineFlush },
    { category: "SUV TYRE", name: "Japanese SUV Tyre Highway Comfort", price: "Tk 15,200.00", reviews: 4, crop: productImages.fuelCleaner },
    { category: "CAR TYRE", name: "Performance Touring Tyre 16 Inch", price: "Tk 13,600.00", reviews: 3, crop: productImages.battery },
    { category: "TYRE CARE", name: "Tyre Shine And Rubber Protectant", price: "Tk 780.00", reviews: 7, crop: productImages.acCleaner },
    { category: "TYRE ACCESSORIES", name: "Digital Tyre Pressure Gauge", price: "Tk 1,450.00", reviews: 2, crop: productImages.blackIce },
    { category: "RIM SIZE", name: "Rim Size Matched Tyre Selection", price: "Tk 10,900.00", reviews: 5, crop: productImages.perfumeAqua },
    { category: "TYRE CARE", name: "Emergency Tyre Repair Kit Compact", price: "Tk 1,850.00", reviews: 6, crop: productImages.washer },
    { category: "SUV TYRE", name: "Heavy Duty SUV Tyre 17 Inch", price: "Tk 16,800.00", reviews: 3, crop: productImages.romance },
    { category: "CAR TYRE", name: "Comfort Touring Tyre 185/65R15", price: "Tk 9,900.00", reviews: 5, crop: productImages.engineFlush },
    { category: "TYRE ACCESSORIES", name: "Valve Cap And Nozzle Extension Kit", price: "Tk 320.00", reviews: 4, crop: productImages.battery },
  ],
  LUBRICANT: [
    { category: "ADDITIVES FLUID", name: "Liqui Moly Engine Flush Plus - 300mL", price: "Tk 850.00", reviews: 0, crop: productImages.engineFlush },
    { category: "ADDITIVES FLUID", name: "Chevron Techron Fuel System Cleaner (U...", price: "Tk 1,650.00", reviews: 2, crop: productImages.fuelCleaner },
    { category: "CAR CARE DETAILING", name: "Flamingo AC Pro Car Air Conditioner Clea...", price: "Tk 650.00", reviews: 4, crop: productImages.acCleaner },
    { category: "ENGINE OIL", name: "Premium Engine Oil 5W-30 Twin Pack", price: "Tk 5,800.00", reviews: 5, crop: productImages.perfumeAqua },
    { category: "TRANSMISSION FLUID", name: "CVT Transmission Fluid Japanese Grade", price: "Tk 2,950.00", reviews: 3, crop: productImages.blackIce },
    { category: "COOLANT", name: "Ready-To-Use Coolant Concentrate", price: "Tk 1,150.00", reviews: 8, crop: productImages.romance },
    { category: "ENGINE OIL", name: "Synthetic 0W-20 Engine Oil Bottle", price: "Tk 3,400.00", reviews: 4, crop: productImages.battery },
    { category: "ADDITIVES FLUID", name: "Fuel Injector Deep Cleaner Additive", price: "Tk 1,250.00", reviews: 2, crop: productImages.fuelCleaner },
    { category: "ENGINE OIL", name: "Mobil 1 Fully Synthetic 5W-30 Oil", price: "Tk 4,950.00", reviews: 7, crop: productImages.perfumeAqua },
    { category: "COOLANT", name: "Long Life Radiator Coolant Green", price: "Tk 980.00", reviews: 5, crop: productImages.romance },
  ],
};

const tabs = Object.keys(tabData);

const tabIcons = {
  "CAR ACCESSORIES": "accessories",
  "CAR PARTS": "parts",
  TYRES: "tyre",
  LUBRICANT: "lubricant",
};

const quoteLabels = {
  "CAR ACCESSORIES": "ACCESSORIES",
  "CAR PARTS": "PART",
  TYRES: "TYRE",
  LUBRICANT: "LUBRICANT",
};

const viewAllLinks = {
  "CAR ACCESSORIES": "/accessories",
  "CAR PARTS": "/car-parts",
  TYRES: "/tyres",
  LUBRICANT: "/lubricant",
};

function expandProducts(products, total = 20) {
  if (!products?.length) return [];
  return Array.from({ length: total }, (_, index) => products[index % products.length]);
}

function getProductTab(product) {
  const haystack = `${product.category || ""} ${product.name || ""}`.toLowerCase();

  if (/(tyre|tire|rim|wheel)/.test(haystack)) return "TYRES";
  if (/(lubricant|engine oil|oil|coolant|fluid|atf|cvt|flush|additive)/.test(haystack)) return "LUBRICANT";
  if (/(accessor|car care|perfume|freshener|holder|wax|shampoo|washer|interior|exterior|electronics|lifestyle)/.test(haystack)) return "CAR ACCESSORIES";
  return "CAR PARTS";
}

function buildDisplayTabData(cmsProducts) {
  if (!Array.isArray(cmsProducts) || cmsProducts.length === 0) return tabData;

  const grouped = Object.fromEntries(tabs.map((tab) => [tab, []]));

  cmsProducts.forEach((product) => {
    grouped[getProductTab(product)].push(product);
  });

  return Object.fromEntries(
    tabs.map((tab) => [tab, grouped[tab].length ? grouped[tab] : tabData[tab]])
  );
}

const bestSellingProducts = [
  tabData["CAR PARTS"][0],
  tabData["CAR PARTS"][4],
  tabData["CAR PARTS"][2],
  tabData["CAR PARTS"][7],
  tabData["CAR PARTS"][1],
  tabData.LUBRICANT[1],
  tabData["CAR ACCESSORIES"][0],
  tabData.TYRES[3],
];

const latestJapaneseProducts = [
  tabData["CAR PARTS"][1],
  tabData["CAR PARTS"][3],
  tabData["CAR PARTS"][5],
  tabData.LUBRICANT[3],
  tabData.LUBRICANT[6],
  tabData.TYRES[0],
  tabData.TYRES[6],
  tabData["CAR ACCESSORIES"][5],
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function CardCartIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6h15l-2 8H8L6 3H3" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}

export function ProductCardInfo({ product, productUrl, onAdd, isAdded = false }) {
  return (
    <div className="pt-[18px]">
      <p className="text-[11px] font-bold uppercase leading-none tracking-[0.24em] text-[#ef3338]">{product.category}</p>
      <h3 className="mt-[10px] min-h-[40px] text-[16px] font-black leading-5 text-[#111827] transition group-hover/product:text-[#e12526]">
        <a href={productUrl} className="line-clamp-2">{product.name}</a>
      </h3>
      <div className="mt-4 h-px w-full bg-[#eef0f3]" />
      <p className="mt-3 text-[10px] font-black uppercase leading-none tracking-[0.32em] text-[#a6adba]">Starting From</p>
      <div className="mt-2 flex min-h-[28px] items-end gap-2">
        <p className="text-[23px] font-black leading-none tracking-[-0.04em] text-[#e12526]">{product.price}</p>
        {product.oldPrice ? <p className="pb-0.5 text-[13px] font-bold leading-none text-[#9ca3af] line-through">{product.oldPrice}</p> : null}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-[44px] flex-1 items-center justify-center gap-3 rounded-[9px] bg-[#ef3338] px-5 text-[15px] font-black !text-white shadow-[0_10px_20px_rgba(220,38,38,0.24)] transition hover:bg-[#d91f25]"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
          <span className="text-[20px] leading-none">→</span>
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="grid size-[44px] shrink-0 place-items-center rounded-[9px] border border-[#e5e7eb] bg-white text-[#111827] transition hover:border-[#f7d95f] hover:bg-[#fffafa] hover:text-[#e12526] hover:shadow-[0_10px_20px_rgba(220,38,38,0.12)]"
          aria-label={`Add ${product.name} to cart`}
        >
          <CardCartIcon className="size-5" />
          <span className="sr-only">{isAdded ? "Added" : "Add to cart"}</span>
        </button>
      </div>
    </div>
  );
}

function TabIcon({ name }) {
  const common = "size-4";

  if (name === "accessories") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 5h14v6H5z" />
        <path d="M7 11v8h10v-8" />
        <path d="M9 8h6" />
        <path d="M12 5v14" />
      </svg>
    );
  }

  if (name === "parts") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
      </svg>
    );
  }

  if (name === "tyre") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M17.7 6.3l-2.1 2.1M8.4 15.6l-2.1 2.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z" />
      <path d="M9.5 14.5c1.5 1 3.5 1 5 0" />
    </svg>
  );
}

function CtaIcon({ name }) {
  if (name === "box") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M21 8.5 12 3 3 8.5l9 5.5 9-5.5Z" />
        <path d="M3 8.5V16l9 5 9-5V8.5" />
        <path d="M12 14v7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export default function ProductTabs({ cmsProducts = [] }) {
  const [activeTab, setActiveTab] = useState("CAR ACCESSORIES");
  const [addedItems, setAddedItems] = useState([]);
  const [cartProduct, setCartProduct] = useState(null);
  const [remoteProducts, setRemoteProducts] = useState([]);
  const dynamicProducts = cmsProducts.length ? cmsProducts : remoteProducts;
  const displayTabData = buildDisplayTabData(dynamicProducts);
  const visibleProducts = expandProducts(displayTabData[activeTab], 20);

  useEffect(() => {
    if (cmsProducts.length) return undefined;

    let mounted = true;

    fetch("/api/homepage/featured-products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted) return;
        const products = payload?.products;
        if (Array.isArray(products) && products.length) setRemoteProducts(products);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [cmsProducts.length]);

  async function handleAddToCart(product) {
    setAddedItems((items) => (items.includes(product.name) ? items : [...items, product.name]));
    setCartProduct(product);
    await addProductToCart(product);
  }

  return (
    <section id="featured-products" className="bg-white pt-[72px] pb-16 max-sm:pt-10">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto mb-14 max-w-[980px] text-center max-sm:mb-9">
          <div className="inline-flex h-[44px] items-center gap-2 rounded-[10px] bg-[#ef3338] px-7 text-[14px] font-black uppercase tracking-[0.04em] text-white shadow-[0_14px_28px_rgba(220,38,38,0.24)] max-sm:h-auto max-sm:px-5 max-sm:py-3 max-sm:text-[12px]">
            <span className="text-[17px]">☆</span>
            Handpicked Selection
          </div>

          <h2 className="mt-8 text-[56px] font-black leading-none tracking-[-0.06em] text-[#111827] max-lg:text-[46px] max-sm:text-[34px]">
            Premium Quality <span className="text-[#df2026]">Featured Premium Products</span>
          </h2>
          <span className="mx-auto mt-7 block h-1 w-24 rounded-full bg-[#ef3338]" />
        </div>

        <div className="mx-auto flex w-fit max-w-full items-center justify-start gap-3 overflow-x-auto rounded-full bg-[#fff6f6]/70 p-2 shadow-[0_12px_30px_rgba(220,38,38,0.08)] sm:justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-6 py-3 text-[15px] font-black leading-none tracking-[0.02em] transition max-sm:px-4 max-sm:text-[13px] ${
                activeTab === tab
                  ? "border-[#ef3338] bg-[#ef3338] text-white shadow-[0_14px_28px_rgba(220,38,38,0.24)]"
                  : "border-[#ef3338]/35 bg-white/45 text-[#263755] hover:border-[#ef3338] hover:bg-white hover:text-[#df2026]"
              }`}
            >
              <TabIcon name={tabIcons[tab]} />
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-4 gap-x-[24px] gap-y-[44px] max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:mt-7 max-sm:grid-cols-1 max-sm:gap-y-6">
          {visibleProducts.map((product, index) => (
            <article key={`${product.name}-${index}`} className="group/product rounded-[10px] border border-transparent bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:bg-[#fffafa] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)]">
              <div className="block">
                <div className="relative overflow-hidden rounded-[6px]">
                  {(() => {
                    const productUrl = `/products/${product.slug || slugify(product.name)}`;
                    return (
                      <>
                  <a
                    href={productUrl}
                    className={`block aspect-square rounded-[6px] bg-white bg-no-repeat transition duration-200 group-hover/product:scale-[1.012] ${
                      product.image ? "bg-cover bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
                    }`}
                    style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
                    aria-label={product.name}
                  />
                  <ProductQuickActions productUrl={productUrl} productName={product.name} />
                      </>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-9 left-1/2 z-10 flex h-[39px] min-w-[126px] -translate-x-1/2 translate-y-3 items-center justify-center rounded-full bg-black px-6 text-[13px] font-black text-white opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition duration-200 hover:bg-[#d3191d] group-hover/product:translate-y-0 group-hover/product:opacity-100 group-focus-within/product:translate-y-0 group-focus-within/product:opacity-100"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    {addedItems.includes(product.name) ? "Added" : "Add To Cart"}
                  </button>
                </div>
                <ProductCardInfo product={product} productUrl={`/products/${product.slug || slugify(product.name)}`} onAdd={() => handleAddToCart(product)} isAdded={addedItems.includes(product.name)} />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <a
            href={viewAllLinks[activeTab]}
            className="inline-flex h-[70px] min-w-[324px] items-center justify-center gap-4 rounded-[14px] border border-transparent bg-[#ef3338] px-10 text-[22px] font-black !text-white shadow-[0_14px_28px_rgba(220,38,38,0.24)] transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:bg-[#d3191d] hover:shadow-[0_16px_34px_rgba(220,38,38,0.18)] max-sm:h-[58px] max-sm:min-w-full max-sm:text-[17px]"
          >
            <CtaIcon name="box" />
            View All Products
            <CtaIcon name="arrow" />
          </a>
          <a
            href="#parts-inquiry"
            className="inline-flex h-[70px] min-w-[324px] items-center justify-center gap-4 rounded-[14px] border-2 border-[#d1d5db] bg-white px-10 text-[21px] font-black text-[#374151] transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:bg-[#fffafa] hover:text-[#d3191d] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)] max-sm:h-[58px] max-sm:min-w-full max-sm:text-[16px]"
          >
            Request a {quoteLabels[activeTab]} Quote
            <CtaIcon name="arrow" />
          </a>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-9 text-[16px] font-semibold text-[#4b5563] max-sm:gap-4 max-sm:text-[14px]">
          <span className="inline-flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-[#e9fff0] text-[#16a34a]">↗</span>
            Most Popular
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-[#fff0f0] text-[#ef3338]">♙</span>
            Premium Quality
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-[#eef4ff] text-[#2563eb]">✓</span>
            Verified Authentic
          </span>
        </div>
      </div>
      <CartDrawer product={cartProduct} open={Boolean(cartProduct)} onClose={() => setCartProduct(null)} />
    </section>
  );
}

export function BestSellingAutoParts() {
  const [addedItems, setAddedItems] = useState([]);
  const [cartProduct, setCartProduct] = useState(null);

  async function handleAddToCart(product) {
    setAddedItems((items) => (items.includes(product.name) ? items : [...items, product.name]));
    setCartProduct(product);
    await addProductToCart(product);
  }

  return (
    <section id="best-selling-parts" className="bg-white py-20 max-sm:py-14">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
        <div className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-[#f13d42] px-6 text-[14px] font-black uppercase text-white shadow-[0_14px_24px_rgba(220,38,38,0.22)]">
          <span>↗</span>
          Most Popular
        </div>
        <h2 className="mt-9 text-[48px] font-black leading-none tracking-[-0.05em] text-[#111827] max-sm:text-[34px]">
          Best Selling <span className="text-[#e12526]">Auto Parts</span>
        </h2>
        <p className="mt-7 text-[20px] leading-8 text-[#4b5563] max-sm:text-[16px]">
          Discover our most trusted and popular authentic Japanese automotive parts
        </p>

        <div className="related-product-marquee mt-12 overflow-hidden text-left max-sm:mt-8">
          <div className="related-product-track flex w-max gap-[30px]">
          {[...bestSellingProducts, ...bestSellingProducts].map((product, index) => (
            <article key={`${product.name}-${index}`} className="group/product w-[370px] shrink-0 rounded-[10px] border border-transparent bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:bg-[#fffafa] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)] max-sm:w-[285px]">
              <div className="relative overflow-hidden rounded-[6px]">
                {(() => {
                  const productUrl = `/products/${product.slug || slugify(product.name)}`;
                  return (
                    <>
                <a
                  href={productUrl}
                  className={`block h-[320px] rounded-[6px] bg-white bg-no-repeat transition duration-200 group-hover/product:scale-[1.012] max-sm:h-[260px] ${
                    product.image ? "bg-cover bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
                  }`}
                  style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
                  aria-label={product.name}
                />
                <ProductQuickActions productUrl={productUrl} productName={product.name} />
                    </>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="absolute bottom-9 left-1/2 z-10 flex h-[39px] min-w-[126px] -translate-x-1/2 translate-y-3 items-center justify-center rounded-full bg-black px-6 text-[13px] font-black text-white opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition duration-200 hover:bg-[#d3191d] group-hover/product:translate-y-0 group-hover/product:opacity-100 group-focus-within/product:translate-y-0 group-focus-within/product:opacity-100"
                  aria-label={`Add ${product.name} to cart`}
                >
                  {addedItems.includes(product.name) ? "Added" : "Add To Cart"}
                </button>
              </div>
              <ProductCardInfo product={product} productUrl={`/products/${product.slug || slugify(product.name)}`} onAdd={() => handleAddToCart(product)} isAdded={addedItems.includes(product.name)} />
            </article>
          ))}
          </div>
        </div>
      </div>
      <CartDrawer product={cartProduct} open={Boolean(cartProduct)} onClose={() => setCartProduct(null)} />
    </section>
  );
}

export function LatestJapaneseAutoParts() {
  const [addedItems, setAddedItems] = useState([]);
  const [cartProduct, setCartProduct] = useState(null);

  async function handleAddToCart(product) {
    setAddedItems((items) => (items.includes(product.name) ? items : [...items, product.name]));
    setCartProduct(product);
    await addProductToCart(product);
  }

  return (
    <section id="latest-japanese-parts" className="bg-[#f8f9fb] py-20 max-sm:py-14">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
        <div className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-[#d91f25] px-6 text-[14px] font-black uppercase text-white shadow-[0_14px_24px_rgba(220,38,38,0.22)]">
          <span>✣</span>
          Fresh Arrivals
        </div>
        <h2 className="mt-9 text-[48px] font-black leading-[1.12] tracking-[-0.05em] text-[#111827] max-sm:text-[34px]">
          Latest Japanese <span className="text-[#e12526]">Auto Parts</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[720px] text-[21px] leading-8 text-[#4b5563] max-sm:text-[16px]">
          Explore the newest additions to our collection of premium automotive components
        </p>

        <div className="related-product-marquee mt-12 overflow-hidden text-left max-sm:mt-8">
          <div className="related-product-track related-product-track-reverse flex w-max gap-[30px]">
          {[...latestJapaneseProducts, ...latestJapaneseProducts].map((product, index) => (
            <article key={`${product.name}-${index}`} className="group/product w-[370px] shrink-0 rounded-[10px] border border-transparent bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:bg-[#fffafa] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)] max-sm:w-[285px]">
              <div className="relative overflow-hidden rounded-[6px]">
                {(() => {
                  const productUrl = `/products/${product.slug || slugify(product.name)}`;
                  return (
                    <>
                <a
                  href={productUrl}
                  className={`block h-[320px] rounded-[6px] bg-white bg-no-repeat transition duration-200 group-hover/product:scale-[1.012] max-sm:h-[260px] ${
                    product.image ? "bg-cover bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
                  }`}
                  style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
                  aria-label={product.name}
                />
                <ProductQuickActions productUrl={productUrl} productName={product.name} />
                    </>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="absolute bottom-9 left-1/2 z-10 flex h-[39px] min-w-[126px] -translate-x-1/2 translate-y-3 items-center justify-center rounded-full bg-black px-6 text-[13px] font-black text-white opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition duration-200 hover:bg-[#d3191d] group-hover/product:translate-y-0 group-hover/product:opacity-100 group-focus-within/product:translate-y-0 group-focus-within/product:opacity-100"
                  aria-label={`Add ${product.name} to cart`}
                >
                  {addedItems.includes(product.name) ? "Added" : "Add To Cart"}
                </button>
              </div>
              <ProductCardInfo product={product} productUrl={`/products/${product.slug || slugify(product.name)}`} onAdd={() => handleAddToCart(product)} isAdded={addedItems.includes(product.name)} />
            </article>
          ))}
          </div>
        </div>
      </div>
      <CartDrawer product={cartProduct} open={Boolean(cartProduct)} onClose={() => setCartProduct(null)} />
    </section>
  );
}
