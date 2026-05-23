"use client";

import { useMemo, useState } from "react";
import CartDrawer from "../CartDrawer";
import { addProductToCart } from "../commerce-client";
import DynamicFilters, { deriveBrand, makeFacetOptions, priceRangeText } from "../DynamicFilters";
import ProductPagination from "../ProductPagination";
import { ProductCardInfo } from "../ProductTabs";
import ProductQuickActions from "../ProductQuickActions";

const accessoryCategories = ["All", "Interior", "Exterior", "Electronics", "Car Care", "Utility", "Safety", "Performance", "Lifestyle"];

const accessories = [
  { category: "Car Care", name: "Flamingo AC Pro Air Conditioner Cleaner", price: "Tk 650.00", reviews: 4, image: "/accessory-ac-pro.jpeg" },
  { category: "Car Care", name: "Flamingo Windshield Washer Fluid", price: "Tk 480.00", reviews: 6, image: "/accessory-windshield-washer.jpeg" },
  { category: "Interior", name: "Flamingo Lemon Air Freshener Spray", price: "Tk 390.00", reviews: 5, image: "/accessory-air-freshener-yellow.jpeg" },
  { category: "Car Care", name: "Flamingo Premium Hard Wax", price: "Tk 950.00", reviews: 7, image: "/accessory-hard-wax.jpeg" },
  { category: "Car Care", name: "Kangaroo Car Shampoo 650ml", price: "Tk 720.00", reviews: 8, image: "/accessory-car-shampoo.jpeg" },
  { category: "Electronics", name: "MOXOM Wide-Angle Rotating Car Holder", price: "Tk 1,250.00", reviews: 5, image: "/accessory-wide-angle-holder.jpeg" },
  { category: "Lifestyle", name: "Luxe Badee Al Oud Air Freshener", price: "Tk 1,150.00", reviews: 6, image: "/accessory-luxe-air-freshener.jpeg" },
  { category: "Electronics", name: "Joyroom Suction Car Phone Holder", price: "Tk 1,450.00", reviews: 4, image: "/accessory-joyroom-holder.jpeg" },
  { category: "Electronics", name: "Yesido Wireless Holder 15W C197", price: "Tk 1,850.00", reviews: 5, image: "/accessory-yesido-wireless-holder.jpeg" },
  { category: "Electronics", name: "Yesido C267 Suction Windshield Holder", price: "Tk 1,650.00", reviews: 5, image: "/accessory-yesido-car-holder.jpeg" },
  { category: "Exterior", name: "Premium Scratch Guard Door Protector", price: "Tk 590.00", reviews: 3, image: "/accessory-wide-angle-holder.jpeg" },
  { category: "Utility", name: "Foldable Trunk Organizer Box", price: "Tk 1,090.00", reviews: 7, image: "/accessory-joyroom-holder.jpeg" },
  { category: "Safety", name: "Compact Emergency Safety Kit", price: "Tk 1,350.00", reviews: 4, image: "/accessory-yesido-car-holder.jpeg" },
  { category: "Performance", name: "Cabin Performance Cleaner Additive", price: "Tk 850.00", reviews: 5, image: "/accessory-ac-pro.jpeg" },
  { category: "Interior", name: "Premium Dashboard Perfume Set", price: "Tk 980.00", reviews: 6, image: "/accessory-luxe-air-freshener.jpeg" },
  { category: "Exterior", name: "Water Repellent Glass Treatment", price: "Tk 760.00", reviews: 4, image: "/accessory-windshield-washer.jpeg" },
  { category: "Utility", name: "Multi-Purpose Microfiber Towel Pack", price: "Tk 420.00", reviews: 9, image: "/accessory-air-freshener-yellow.jpeg" },
  { category: "Lifestyle", name: "Luxury Oud Car Fragrance Spray", price: "Tk 1,250.00", reviews: 5, image: "/accessory-luxe-air-freshener.jpeg" },
];

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

function FilterIcon({ category }) {
  const icons = {
    All: "M4 6h16M4 12h16M4 18h16",
    Interior: "M5 13h14l-1.5-4.5A2 2 0 0 0 15.6 7H8.4a2 2 0 0 0-1.9 1.5L5 13Zm1 0v4h2m10-4v4h-2",
    Exterior: "M4 14h16M6 14l1.6-4.7A2 2 0 0 1 9.5 8h5a2 2 0 0 1 1.9 1.3L18 14M8 11h8",
    Electronics: "m13 2-9 12h7l-1 8 10-13h-7V2Z",
    "Car Care": "M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z",
    Utility: "M21 8.5 12 3 3 8.5l9 5.5 9-5.5ZM3 8.5V16l9 5 9-5V8.5",
    Safety: "M20 6 9 17l-5-5",
    Performance: "m4 17 6-6 4 4 6-8M15 7h5v5",
    Lifestyle: "m12 3 2.6 5.5 6 .9-4.3 4.2 1 6-5.3-2.9-5.3 2.9 1-6-4.3-4.2 6-.9L12 3Z",
  };

  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[category]} />
    </svg>
  );
}

function ProductCard({ product, isAdded, onAdd }) {
  const productUrl = `/products/${slugify(product.name)}`;

  return (
    <article className="group/product rounded-[10px] border border-transparent bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:bg-[#fffafa] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)]">
      <div className="relative overflow-hidden rounded-[6px]">
        <a
          href={productUrl}
          className="block aspect-square rounded-[6px] bg-cover bg-center bg-no-repeat transition duration-200 group-hover/product:scale-[1.012]"
          style={{ backgroundImage: `url(${product.image})` }}
          aria-label={product.name}
        />
        <ProductQuickActions productUrl={productUrl} productName={product.name} />
        <button
          type="button"
          onClick={() => onAdd(product.name)}
          className="absolute bottom-9 left-1/2 z-10 flex h-[39px] min-w-[126px] -translate-x-1/2 translate-y-3 items-center justify-center rounded-full bg-black px-6 text-[13px] font-black text-white opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition duration-200 hover:bg-[#d3191d] group-hover/product:translate-y-0 group-hover/product:opacity-100 group-focus-within/product:translate-y-0 group-focus-within/product:opacity-100"
          aria-label={`Add ${product.name} to cart`}
        >
          {isAdded ? "Added" : "Add To Cart"}
        </button>
      </div>
      <ProductCardInfo product={product} productUrl={productUrl} onAdd={() => onAdd(product)} isAdded={isAdded} />
    </article>
  );
}

export default function CarAccessoriesClient() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [addedItems, setAddedItems] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartProduct, setCartProduct] = useState(null);

  const brandOptions = useMemo(() => makeFacetOptions(accessories.map((product) => deriveBrand(product.name))), []);
  const productTypeOptions = useMemo(() => makeFacetOptions(accessories.map((product) => product.category)), []);
  const priceText = useMemo(() => priceRangeText(accessories), []);

  const filteredProducts = useMemo(() => {
    const matches = accessories.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(deriveBrand(product.name));
      const matchesProductType = selectedProductTypes.length === 0 || selectedProductTypes.includes(product.category);
      return matchesCategory && matchesSearch && matchesBrand && matchesProductType;
    });

    return expandProducts(matches);
  }, [activeCategory, searchTerm, selectedBrands, selectedProductTypes]);

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
              Accessories Collection
            </div>
            <h1 className="mt-8 text-[56px] font-black leading-none tracking-[-0.06em] text-[#111827] max-lg:text-[44px] max-sm:text-[34px]">
              Premium <span className="text-[#df2026]">Car Accessories</span>
            </h1>
            <span className="mx-auto mt-7 block h-1 w-24 rounded-full bg-[#ef3338]" />
            <p className="mx-auto mt-6 max-w-[720px] text-[19px] leading-8 text-[#4b5563] max-sm:text-[15px]">
              Interior, exterior, electronics, car care, utility, safety, performance and lifestyle accessories.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-9 rounded-[14px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center gap-3">
              {accessoryCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-[14px] font-black transition ${
                    activeCategory === category
                      ? "border-[#ef3338] bg-[#ef3338] text-white shadow-[0_12px_24px_rgba(220,38,38,0.2)]"
                      : "border-[#ef3338]/30 bg-white text-[#263755] hover:border-[#ef3338] hover:bg-[#fff6f6] hover:text-[#df2026]"
                  }`}
                >
                  <FilterIcon category={category} />
                  {category}
                </button>
              ))}
              <div className="ml-auto min-w-[260px] max-sm:ml-0 max-sm:w-full">
                <label className="sr-only" htmlFor="accessory-search">Search accessories</label>
                <input
                  id="accessory-search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full rounded-full border border-[#d7dce4] px-5 text-[14px] font-semibold text-[#111827] outline-none transition placeholder:text-[#8b95a5] focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10"
                  placeholder="Search accessories"
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

            <div className="grid grid-cols-4 gap-x-[24px] gap-y-[44px] max-2xl:grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
              {paginatedProducts.map((product, index) => (
                <ProductCard key={`${product.name}-${index}`} product={product} isAdded={addedItems.includes(product.name)} onAdd={() => handleAddToCart(product)} />
              ))}
            </div>
          </div>

          {filteredProducts.length > 0 && (
            <ProductPagination currentPage={currentPage} totalPages={TOTAL_PAGES} onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), TOTAL_PAGES))} />
          )}

          {filteredProducts.length === 0 && (
            <div className="rounded-[14px] border border-[#ffd9d9] bg-[#fff7f7] p-10 text-center">
              <h2 className="text-[24px] font-black text-[#111827]">No accessories found</h2>
              <p className="mt-2 text-[#4b5563]">Try another category or search keyword.</p>
            </div>
          )}
        </div>
      </section>
      <CartDrawer product={cartProduct} open={Boolean(cartProduct)} onClose={() => setCartProduct(null)} />
    </main>
  );
}
