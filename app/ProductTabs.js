"use client";

import { useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";
import { addProductToCart, addProductToWishlist } from "./commerce-client";
import { formatPriceDisplay, parsePriceValue } from "./price-format";
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

const PRODUCT_GRID_COLUMNS = 6;
const PRODUCT_ROWS_PER_CLICK = 7;
const PRODUCT_WISHLIST_SELECTION_KEY = "jpspare-product-wishlist-selection";
const PRODUCT_COMPARE_SELECTION_KEY = "jpspare-product-compare-selection";
const PRODUCT_COMPARE_ITEMS_KEY = "jpspare-product-compare-items";

function getProductKey(product) {
  return product?.slug || `${product?.category || ""}-${product?.name || ""}-${product?.price || ""}`;
}

function readProductSelection(storageKey) {
  if (typeof window === "undefined") return [];

  try {
    const storedSelection = window.localStorage.getItem(storageKey);
    const parsedSelection = storedSelection ? JSON.parse(storedSelection) : [];
    return Array.isArray(parsedSelection) ? parsedSelection : [];
  } catch {
    return [];
  }
}

function saveProductSelection(storageKey, productKey) {
  if (typeof window === "undefined" || !productKey) return [];

  const nextSelection = Array.from(new Set([...readProductSelection(storageKey), productKey]));
  window.localStorage.setItem(storageKey, JSON.stringify(nextSelection));
  return nextSelection;
}

function saveCompareProductItem(product, productKey) {
  if (typeof window === "undefined" || !productKey) return [];

  try {
    const storedItems = window.localStorage.getItem(PRODUCT_COMPARE_ITEMS_KEY);
    const parsedItems = storedItems ? JSON.parse(storedItems) : [];
    const currentItems = Array.isArray(parsedItems) ? parsedItems : [];
    const nextItem = {
      key: productKey,
      slug: product.slug || "",
      name: product.name || product.title || "",
      title: product.title || product.name || "",
      category: product.category || "",
      brand: getProductBrand(product),
      price: product.price || "",
      image: product.image || "",
      crop: product.crop || "",
      reviews: product.reviews || product.rating || 4.5,
    };
    const nextItems = [nextItem, ...currentItems.filter((item) => item?.key !== productKey)].slice(0, 3);
    window.localStorage.setItem(PRODUCT_COMPARE_ITEMS_KEY, JSON.stringify(nextItems));
    return nextItems;
  } catch {
    return [];
  }
}

function shuffleProducts(products) {
  if (!products?.length) return [];
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function createProductCycle(products, previousProduct) {
  const cycle = shuffleProducts(products);
  if (cycle.length > 1 && getProductKey(cycle[0]) === getProductKey(previousProduct)) {
    cycle.push(cycle.shift());
  }
  return cycle;
}

function extendProductRotation(existingProducts, sourceProducts, total) {
  if (!sourceProducts?.length) return [];
  const nextProducts = [...existingProducts];

  while (nextProducts.length < total) {
    nextProducts.push(...createProductCycle(sourceProducts, nextProducts[nextProducts.length - 1]));
  }

  return nextProducts.slice(0, total);
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

const bestSellingCategoryGroups = tabs.map((tab) => ({
  title: tab,
  products: tabData[tab].slice(0, 5),
}));
const bestSellingProducts = bestSellingCategoryGroups.flatMap((group) => group.products);

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

function CardHeartIcon({ className = "size-5", filled = false }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function CardCompareIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 17 6-6 4 4 6-8" />
      <path d="M15 7h5v5" />
    </svg>
  );
}

function hashProductKey(value = "") {
  return [...String(value)].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function getRegularPriceMeta(product) {
  const salePrice = parsePriceValue(product.price);
  if (!salePrice) return null;

  const productKey = getProductKey(product);
  const keyHash = hashProductKey(productKey);
  const shouldShowGeneratedPrice = [0, 2, 4].includes(keyHash % 6);
  const explicitRegularPrice = parsePriceValue(product.oldPrice || product.regularPrice);
  const generatedDiscount = [12, 16, 21, 24, 29][keyHash % 5];
  const regularPrice = explicitRegularPrice && explicitRegularPrice > salePrice
    ? explicitRegularPrice
    : shouldShowGeneratedPrice
      ? Math.round(salePrice / (1 - generatedDiscount / 100))
      : null;

  if (!regularPrice || regularPrice <= salePrice) return null;

  return {
    discount: Math.round(((regularPrice - salePrice) / regularPrice) * 100),
    regularPrice,
  };
}

function getProductBrand(product) {
  if (product.brand?.name) return product.brand.name;
  if (product.brand) return product.brand;

  const name = product.name || product.title || "";
  const knownBrands = ["Liqui Moly", "Flamingo", "Kangaroo", "Philips", "Yesido", "Joyroom", "MOXOM", "Chevron", "TOKICO", "DENSO", "Mobil", "Brembo", "Michelin"];
  return knownBrands.find((brand) => name.toLowerCase().includes(brand.toLowerCase())) || name.split(" ")[0] || "JPSPARE";
}

export function ProductCardInfo({ product, productUrl, onAdd, onWishlist, isAdded = false, compact = false, cardIndex }) {
  const productSelectionKey = getProductKey(product);
  const [wishlistSelected, setWishlistSelected] = useState(false);
  const [compareSelected, setCompareSelected] = useState(false);
  const regularPriceMeta = getRegularPriceMeta(product);
  const productBrand = getProductBrand(product);
  const showFreeDelivery = Boolean(product.freeDelivery || product.freeDeliveryEligible || (Number.isInteger(cardIndex) && cardIndex % 6 === 1));
  const handleWishlist = onWishlist || (() => addProductToWishlist(product));
  const compareButtonClassName = `${compact ? "product-compare-button absolute right-0 top-0 grid size-8 shrink-0 translate-y-[-4px] place-items-center rounded-[7px] border border-[#e5e7eb] bg-white text-[#111827] opacity-0 shadow-[0_6px_14px_rgba(15,23,42,0.08)] transition duration-200 hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)] hover:bg-[#fffafa] hover:text-[#e12526] focus-visible:opacity-100 group-hover/product:opacity-100" : "product-compare-button absolute right-0 top-0 grid size-9 shrink-0 translate-y-[-4px] place-items-center rounded-[8px] border border-[#e5e7eb] bg-white text-[#111827] opacity-0 shadow-[0_6px_14px_rgba(15,23,42,0.08)] transition duration-200 hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)] hover:bg-[#fffafa] hover:text-[#e12526] focus-visible:opacity-100 group-hover/product:opacity-100"} ${compareSelected ? "!border-[#ef3338] !bg-[#ef3338] !text-white !opacity-100 shadow-[0_8px_18px_rgba(239,51,56,0.20)]" : ""}`;
  const wishlistButtonClassName = `${compact ? "product-wishlist-button grid size-9 shrink-0 place-items-center rounded-[7px] border border-[#e5e7eb] bg-white text-[#111827] transition hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)] hover:bg-[#fffafa] hover:text-[#e12526] hover:shadow-[0_8px_16px_rgba(220,38,38,0.10)]" : "product-wishlist-button grid size-[44px] shrink-0 place-items-center rounded-[9px] border border-[#e5e7eb] bg-white text-[#111827] transition hover:border-[#f7d95f] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)] hover:bg-[#fffafa] hover:text-[#e12526] hover:shadow-[0_10px_20px_rgba(220,38,38,0.12)]"} ${wishlistSelected ? "!border-[#ef3338] !bg-[#ef3338] !text-white shadow-[0_8px_18px_rgba(239,51,56,0.20)]" : ""}`;

  useEffect(() => {
    setWishlistSelected(readProductSelection(PRODUCT_WISHLIST_SELECTION_KEY).includes(productSelectionKey));
    setCompareSelected(readProductSelection(PRODUCT_COMPARE_SELECTION_KEY).includes(productSelectionKey));
  }, [productSelectionKey]);

  const handleCompareSelect = (event) => {
    event.preventDefault();
    const nextSelection = saveProductSelection(PRODUCT_COMPARE_SELECTION_KEY, productSelectionKey);
    saveCompareProductItem(product, productSelectionKey);
    setCompareSelected(true);
    window.dispatchEvent(new CustomEvent("jpspare-compare-change", { detail: { count: nextSelection.length } }));
  };

  const handleWishlistSelect = () => {
    const nextSelection = saveProductSelection(PRODUCT_WISHLIST_SELECTION_KEY, productSelectionKey);
    setWishlistSelected(true);
    window.dispatchEvent(new CustomEvent("jpspare-wishlist-change", { detail: { count: nextSelection.length } }));
    handleWishlist();
  };

  return (
    <div className={compact ? "relative pt-3" : "relative pt-[18px]"}>
      <p className={compact ? "text-[10px] font-black uppercase leading-none tracking-[0.13em] text-[#ef3338]" : "text-[11px] font-bold uppercase leading-none tracking-[0.22em] text-[#ef3338]"}>{product.category}</p>
      <h3 className={compact ? "mt-2 min-h-[44px] text-[15px] font-black leading-[1.34] text-[#111827] transition group-hover/product:text-[#e12526]" : "mt-[10px] min-h-[44px] text-[17px] font-black leading-[1.32] text-[#111827] transition group-hover/product:text-[#e12526]"}>
        <a href={productUrl} className="line-clamp-2">{product.name}</a>
      </h3>
      <div className={compact ? "relative mt-2 min-h-[22px]" : "relative mt-3 min-h-[26px]"}>
        <div className={compact ? "flex flex-wrap items-start gap-1.5 pr-10" : "flex flex-wrap items-start gap-2 pr-12"}>
          <span className={compact ? "rounded-[5px] bg-[#f25a1d] px-2.5 py-1 text-[10.5px] font-black uppercase leading-none tracking-[0.01em] text-white shadow-[0_4px_10px_rgba(242,90,29,0.16)]" : "rounded-[5px] bg-[#f25a1d] px-3 py-1.5 text-[11.5px] font-black uppercase leading-none tracking-[0.01em] text-white shadow-[0_5px_12px_rgba(242,90,29,0.16)]"}>
            {productBrand}
          </span>
          {showFreeDelivery ? (
            <span className={compact ? "rounded-[5px] bg-[#ff8a00] px-2.5 py-1 text-[10.5px] font-black leading-none text-white shadow-[0_4px_10px_rgba(255,138,0,0.16)]" : "rounded-[5px] bg-[#ff8a00] px-3 py-1.5 text-[11.5px] font-black leading-none text-white shadow-[0_5px_12px_rgba(255,138,0,0.16)]"}>
              Free Delivery
            </span>
          ) : null}
        </div>
        <a
          href="/compare"
          onClick={handleCompareSelect}
          className={compareButtonClassName}
          aria-label={`Compare ${product.name}`}
          aria-pressed={compareSelected}
          title="Compare"
        >
          <CardCompareIcon className={compact ? "product-compare-icon size-4" : "product-compare-icon size-[18px]"} />
        </a>
      </div>
      <div className={compact ? "mt-1.5 flex min-h-[26px] items-end gap-2" : "mt-2 flex min-h-[30px] items-end gap-2.5"}>
        <p className={compact ? "product-price-display text-[23px] leading-none text-[#ef171d]" : "product-price-display text-[27px] leading-none text-[#ef171d]"}>{formatPriceDisplay(product.price)}</p>
        {regularPriceMeta ? (
          <>
            <p className={compact ? "product-price-old pb-0.5 text-[12px] leading-none text-[#9ca3af] line-through" : "product-price-old pb-0.5 text-[14px] leading-none text-[#9ca3af] line-through"}>{formatPriceDisplay(regularPriceMeta.regularPrice)}</p>
            <span className={compact ? "mb-[-1px] rounded-[5px] bg-[#fff0e9] px-1.5 py-1 text-[10px] font-black leading-none text-[#ef3338]" : "mb-[-1px] rounded-[6px] bg-[#fff0e9] px-2 py-1 text-[12px] font-black leading-none text-[#ef3338]"}>
              -{regularPriceMeta.discount}%
            </span>
          </>
        ) : null}
      </div>
      <div className={compact ? "product-card-action-panel pointer-events-none absolute -left-2.5 -right-2.5 top-[calc(100%-1px)] z-30 flex translate-y-2 items-center gap-2 rounded-b-[8px] bg-[#fffafa] px-2.5 pb-2.5 pt-3 opacity-0 shadow-[0_22px_34px_rgba(220,38,38,0.18)] transition-all duration-300 ease-out group-hover/product:pointer-events-auto group-hover/product:translate-y-0 group-hover/product:opacity-100" : "product-card-action-panel pointer-events-none absolute -left-2.5 -right-2.5 top-[calc(100%-1px)] z-30 flex translate-y-2 items-center gap-3 rounded-b-[9px] bg-[#fffafa] px-2.5 pb-2.5 pt-4 opacity-0 shadow-[0_24px_38px_rgba(220,38,38,0.18)] transition-all duration-300 ease-out group-hover/product:pointer-events-auto group-hover/product:translate-y-0 group-hover/product:opacity-100"}>
        <button
          type="button"
          onClick={onAdd}
          className={compact ? "product-add-cart-button inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[7px] bg-[#ef3338] px-3 text-[13px] font-black !text-white shadow-[0_8px_16px_rgba(220,38,38,0.20)] transition hover:bg-[#d91f25]" : "product-add-cart-button inline-flex h-[44px] flex-1 items-center justify-center gap-3 rounded-[9px] bg-[#ef3338] px-5 text-[15px] font-black !text-white shadow-[0_10px_20px_rgba(220,38,38,0.24)] transition hover:bg-[#d91f25]"}
          aria-label={`Add ${product.name} to cart`}
        >
          <CardCartIcon className={compact ? "product-add-cart-icon size-4" : "product-add-cart-icon size-5"} />
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleWishlistSelect}
          className={wishlistButtonClassName}
          aria-label={`Add ${product.name} to wishlist`}
          aria-pressed={wishlistSelected}
        >
          <CardHeartIcon className={compact ? "product-wishlist-icon size-4" : "product-wishlist-icon size-5"} filled={wishlistSelected} />
          <span className="sr-only">Add to wishlist</span>
        </button>
      </div>
    </div>
  );
}

export function FeaturedOfferBanners() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <a href="/combo-package" className="group/offer relative min-h-[180px] overflow-hidden rounded-[8px] bg-[linear-gradient(105deg,#fff3da_0%,#ffe4b7_50%,#fff4df_100%)] px-8 py-7 shadow-[0_12px_30px_rgba(245,158,11,0.10)] ring-1 ring-[#f7d95f]/45 transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(245,158,11,0.18)] max-sm:min-h-[220px] max-sm:px-5">
        <div className="relative z-10 max-w-[58%] max-sm:max-w-[72%]">
          <p className="text-[15px] font-black uppercase tracking-[0.12em] text-[#242424]">Exclusive</p>
          <h3 className="mt-1 text-[42px] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#ef3338] max-xl:text-[34px] max-sm:text-[30px]">
            Combo Offers!
          </h3>
          <p className="mt-3 text-[20px] font-black text-[#2b2529] max-sm:text-[16px]">Save More, For Your Car</p>
        </div>
        <div className="absolute right-6 top-5 z-10 flex gap-5 max-sm:right-3 max-sm:top-10 max-sm:gap-2">
          <span className="grid h-[118px] w-[118px] place-items-center rounded-full bg-white/70 text-center text-[12px] font-black text-[#ef3338] shadow-[0_12px_26px_rgba(17,24,39,0.12)] ring-1 ring-white/80 max-sm:h-[92px] max-sm:w-[92px]">
            Engine Oil<br />Filter<br />Combo
          </span>
          <span className="grid h-[118px] w-[118px] place-items-center rounded-full bg-white/70 text-center text-[12px] font-black text-[#ef3338] shadow-[0_12px_26px_rgba(17,24,39,0.12)] ring-1 ring-white/80 max-sm:h-[92px] max-sm:w-[92px]">
            Flamingo<br />Car Care<br />Combo
          </span>
        </div>
        <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_60%_42%,rgba(255,255,255,0.95),transparent_22%),radial-gradient(circle_at_85%_72%,rgba(239,51,56,0.13),transparent_30%)]" />
      </a>

      <a href="/car-accessories" className="group/offer relative min-h-[180px] overflow-hidden rounded-[8px] bg-[linear-gradient(105deg,#ff812d_0%,#ff5b22_58%,#f04a1c_100%)] px-8 py-7 text-white shadow-[0_12px_30px_rgba(239,83,28,0.16)] ring-1 ring-[#ff9a50]/55 transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(239,83,28,0.24)] max-sm:min-h-[220px] max-sm:px-5">
        <div className="relative z-10 ml-auto max-w-[47%] text-right max-sm:max-w-[58%]">
          <p className="text-[22px] font-black uppercase leading-none tracking-[-0.03em] text-[#2b2529] max-sm:text-[18px]">Clean & Shine</p>
          <h3 className="mt-1 text-[44px] font-black uppercase leading-[0.88] tracking-[0.02em] text-white max-xl:text-[36px] max-sm:text-[30px]">
            Car Care
          </h3>
          <p className="mt-1 text-[35px] font-black uppercase leading-none tracking-[0.16em] text-[#2b2529] max-xl:text-[27px] max-sm:text-[22px]">Essentials</p>
        </div>
        <div className="absolute left-8 top-7 z-10 flex items-end gap-2 max-sm:left-4 max-sm:top-12">
          {["SOFT99", "3M", "Flamingo", "Bullson"].map((brand) => (
            <span key={brand} className="grid h-12 min-w-[74px] place-items-center rounded-[5px] bg-white px-2 text-[12px] font-black text-[#ef3338] shadow-[0_8px_18px_rgba(17,24,39,0.12)] max-xl:min-w-[58px] max-xl:text-[10px] max-sm:h-10">
              {brand}
            </span>
          ))}
        </div>
        <div className="absolute bottom-4 left-8 flex gap-2 max-sm:left-4">
          {["/accessory-car-shampoo.jpeg", "/accessory-hard-wax.jpeg", "/accessory-ac-pro.jpeg", "/accessory-windshield-washer.jpeg"].map((image) => (
            <span key={image} className="block size-14 rounded-[6px] bg-white bg-cover bg-center shadow-[0_8px_18px_rgba(17,24,39,0.18)] ring-1 ring-white/70 max-sm:size-12" style={{ backgroundImage: `url(${image})` }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_78%,rgba(255,255,255,0.2),transparent_26%),radial-gradient(circle_at_76%_18%,rgba(255,255,255,0.18),transparent_24%)]" />
      </a>
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
  const [addedItems, setAddedItems] = useState([]);
  const [cartProduct, setCartProduct] = useState(null);
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [visibleRows, setVisibleRows] = useState(PRODUCT_ROWS_PER_CLICK);
  const [productRotation, setProductRotation] = useState([]);
  const dynamicProducts = cmsProducts.length ? cmsProducts : remoteProducts;
  const displayTabData = buildDisplayTabData(dynamicProducts);
  const rotationSourceProducts = tabs.flatMap((tab) => displayTabData[tab] || []);
  const visibleCount = visibleRows * PRODUCT_GRID_COLUMNS;
  const visibleProducts = productRotation.slice(0, visibleCount);

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

  useEffect(() => {
    setVisibleRows(PRODUCT_ROWS_PER_CLICK);
    setProductRotation(extendProductRotation([], rotationSourceProducts, PRODUCT_ROWS_PER_CLICK * PRODUCT_GRID_COLUMNS));
  }, [dynamicProducts]);

  function handleViewMore() {
    const nextRows = visibleRows + PRODUCT_ROWS_PER_CLICK;
    const nextTotal = nextRows * PRODUCT_GRID_COLUMNS;
    setVisibleRows(nextRows);
    setProductRotation((products) => extendProductRotation(products, rotationSourceProducts, nextTotal));
  }

  async function handleAddToCart(product) {
    setAddedItems((items) => (items.includes(product.name) ? items : [...items, product.name]));
    setCartProduct(product);
    await addProductToCart(product);
  }

  async function handleAddToWishlist(product) {
    await addProductToWishlist(product);
  }

  return (
    <section id="featured-products" className="bg-transparent pt-4 pb-8 max-sm:pt-4">
      <div className="mx-auto mt-4 w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)] lg:p-8">
        <div className="mb-3 flex items-center gap-4 text-left max-sm:mb-2">
          <div className="text-[18px] font-black uppercase leading-none tracking-[-0.02em] text-[#111827] max-sm:text-[16px]">
            HANDPICKED SELECTION
          </div>
        </div>

        <div className="grid grid-cols-6 gap-x-5 gap-y-3 max-2xl:grid-cols-5 max-xl:grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-y-3">
          {visibleProducts.map((product, index) => (
            <article key={`${product.name}-${index}`} className="product-card-shell group/product relative z-0 rounded-[8px] border border-transparent bg-transparent p-2.5 transition duration-200 hover:z-30 hover:rounded-b-none hover:bg-[#fffafa] hover:shadow-[0_18px_38px_rgba(220,38,38,0.18)]">
              <span className="product-card-sweep" aria-hidden="true" />
              <div className="block">
                <div className="relative overflow-hidden rounded-[7px]">
                  {(() => {
                    const productUrl = `/products/${product.slug || slugify(product.name)}`;
                    return (
                      <>
                  <a
                    href={productUrl}
                    className={`block aspect-[10/11] rounded-[7px] border border-[#eef0f3] bg-white bg-no-repeat transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.055] ${
                      product.image ? "bg-contain bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
                    }`}
                    style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
                    aria-label={product.name}
                  />
                  <ProductQuickActions productUrl={productUrl} productName={product.name} />
                      </>
                    );
                  })()}
                </div>
                <ProductCardInfo product={product} productUrl={`/products/${product.slug || slugify(product.name)}`} onAdd={() => handleAddToCart(product)} onWishlist={() => handleAddToWishlist(product)} isAdded={addedItems.includes(product.name)} compact cardIndex={index} />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleViewMore}
            className="inline-flex h-[46px] min-w-[178px] items-center justify-center gap-2.5 rounded-[10px] border border-transparent bg-[#ef3338] px-6 text-[15px] font-black !text-white shadow-[0_10px_22px_rgba(220,38,38,0.20)] transition duration-200 hover:-translate-y-0.5 hover:border-[#f7d95f] hover:bg-[#d3191d] hover:shadow-[0_18px_38px_rgba(220,38,38,0.16)] max-sm:h-[44px] max-sm:min-w-[150px] max-sm:px-5 max-sm:text-[14px]"
          >
            <CtaIcon name="box" />
            View More
            <CtaIcon name="arrow" />
          </button>
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

  async function handleAddToWishlist(product) {
    await addProductToWishlist(product);
  }

  return (
    <section id="best-selling-parts" className="bg-transparent py-6 max-sm:py-4">
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)] lg:p-8">
        <div className="mb-3 flex items-center justify-between gap-4 text-left max-sm:mb-2 max-sm:items-center">
          <div className="text-[18px] font-black uppercase leading-none tracking-[-0.02em] text-[#111827] max-sm:text-[16px]">
            BEST SELLING
          </div>
          <a
            href="/products"
            className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-[4px] bg-[#f05a24] px-4 text-[11px] font-black leading-none text-white transition hover:bg-[#ef3338] hover:shadow-[0_10px_20px_rgba(239,51,56,0.18)]"
          >
            View all
          </a>
        </div>

        <div className="related-product-marquee related-product-marquee-float text-left">
          <div className="related-product-track flex w-max gap-5">
          {[...bestSellingProducts, ...bestSellingProducts].map((product, index) => (
            <article key={`${product.name}-${index}`} className="product-card-shell group/product relative z-0 w-[245px] shrink-0 rounded-[8px] border border-transparent bg-transparent p-2.5 transition duration-200 hover:z-30 hover:rounded-b-none hover:bg-[#fffafa] hover:shadow-[0_18px_38px_rgba(220,38,38,0.18)]">
              <span className="product-card-sweep" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[7px]">
                {(() => {
                  const productUrl = `/products/${product.slug || slugify(product.name)}`;
                  return (
                    <>
                      <a
                        href={productUrl}
                        className={`block aspect-[10/11] rounded-[7px] border border-[#eef0f3] bg-white bg-no-repeat transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.055] ${
                          product.image ? "bg-contain bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
                        }`}
                        style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
                        aria-label={product.name}
                      />
                      <ProductQuickActions productUrl={productUrl} productName={product.name} />
                    </>
                  );
                })()}
              </div>
              <ProductCardInfo
                product={product}
                productUrl={`/products/${product.slug || slugify(product.name)}`}
                onAdd={() => handleAddToCart(product)}
                onWishlist={() => handleAddToWishlist(product)}
                isAdded={addedItems.includes(product.name)}
                compact
                cardIndex={index}
              />
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

  async function handleAddToWishlist(product) {
    await addProductToWishlist(product);
  }

  return (
    <section id="latest-japanese-parts" className="bg-transparent pt-4 pb-4 max-sm:py-3">
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)] lg:p-8">
        <div className="mb-3 flex items-center justify-between gap-4 text-left max-sm:mb-2 max-sm:items-center">
          <div className="text-[18px] font-black uppercase leading-none tracking-[-0.02em] text-[#111827] max-sm:text-[16px]">
            NEW ARRIVALS
          </div>
          <a
            href="/offers"
            className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-[4px] bg-[#f05a24] px-4 text-[11px] font-black leading-none text-white transition hover:bg-[#ef3338] hover:shadow-[0_10px_20px_rgba(239,51,56,0.18)]"
          >
            View all
          </a>
        </div>
        <div className="related-product-marquee related-product-marquee-float text-left">
          <div className="related-product-track related-product-track-reverse flex w-max gap-5">
          {[...latestJapaneseProducts, ...latestJapaneseProducts].map((product, index) => (
            <article key={`${product.name}-${index}`} className="product-card-shell group/product relative z-0 w-[245px] shrink-0 rounded-[8px] border border-transparent bg-transparent p-2.5 transition duration-200 hover:z-30 hover:rounded-b-none hover:bg-[#fffafa] hover:shadow-[0_18px_38px_rgba(220,38,38,0.18)]">
              <span className="product-card-sweep" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[7px]">
                {(() => {
                  const productUrl = `/products/${product.slug || slugify(product.name)}`;
                  return (
                    <>
                <a
                  href={productUrl}
                  className={`block aspect-[10/11] rounded-[7px] border border-[#eef0f3] bg-white bg-no-repeat transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.055] ${
                    product.image ? "bg-contain bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
                  }`}
                  style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
                  aria-label={product.name}
                />
                <ProductQuickActions productUrl={productUrl} productName={product.name} />
                    </>
                  );
                })()}
              </div>
              <ProductCardInfo product={product} productUrl={`/products/${product.slug || slugify(product.name)}`} onAdd={() => handleAddToCart(product)} onWishlist={() => handleAddToWishlist(product)} isAdded={addedItems.includes(product.name)} compact cardIndex={index} />
            </article>
          ))}
          </div>
        </div>
      </div>
      <CartDrawer product={cartProduct} open={Boolean(cartProduct)} onClose={() => setCartProduct(null)} />
    </section>
  );
}
