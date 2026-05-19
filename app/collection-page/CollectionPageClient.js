"use client";

import { useMemo, useState } from "react";

const pageData = {
  "sale-offer": {
    eyebrow: "Limited Time Deals",
    title: "Sale Offer",
    highlight: "Collection",
    description: "Special demo discounts on selected Japanese auto parts, accessories, tyres and lubricants.",
    filters: ["All", "Accessories", "Parts", "Tyres", "Lubricants"],
    products: [
      { category: "Accessories", name: "Flamingo AC Pro Air Conditioner Cleaner", price: "Tk 520.00", oldPrice: "Tk 650.00", reviews: 4, image: "/accessory-ac-pro.jpeg" },
      { category: "Accessories", name: "Flamingo Premium Hard Wax", price: "Tk 760.00", oldPrice: "Tk 950.00", reviews: 7, image: "/accessory-hard-wax.jpeg" },
      { category: "Parts", name: "TOKICO Front Shock Absorber B3337", price: "Tk 4,680.00", oldPrice: "Tk 7,800.00", reviews: 5, crop: "bg-[-1318px_-37px]" },
      { category: "Lubricants", name: "Liqui Moly Engine Flush Plus - 300mL", price: "Tk 850.00", oldPrice: "Tk 1,100.00", reviews: 3, crop: "bg-[-1318px_-37px]" },
      { category: "Tyres", name: "Premium All Season Car Tyre 15 Inch", price: "Tk 10,900.00", oldPrice: "Tk 12,400.00", reviews: 5, crop: "bg-[-1318px_-37px]" },
      { category: "Accessories", name: "Kangaroo Car Shampoo 650ml", price: "Tk 620.00", oldPrice: "Tk 720.00", reviews: 8, image: "/accessory-car-shampoo.jpeg" },
    ],
  },
  brands: {
    eyebrow: "Premium Partners",
    title: "Shop Premium",
    highlight: "Brands",
    description: "Browse demo brand collections from trusted Japanese and global automotive manufacturers.",
    filters: ["All", "OEM", "Lubricant", "Tyre", "Accessories"],
    products: [
      { category: "OEM", name: "DENSO Genuine Electrical Components", price: "Explore Brand", reviews: 5, crop: "bg-[-1318px_-506px]" },
      { category: "Lubricant", name: "Mobil 1 Performance Lubricants", price: "Explore Brand", reviews: 6, crop: "bg-[-268px_-507px]" },
      { category: "Tyre", name: "Michelin Premium Tyre Collection", price: "Explore Brand", reviews: 8, crop: "bg-[-1318px_-37px]" },
      { category: "Accessories", name: "Flamingo Car Care Accessories", price: "Explore Brand", reviews: 7, image: "/accessory-ac-pro.jpeg" },
      { category: "OEM", name: "Brembo Brake Performance Parts", price: "Explore Brand", reviews: 5, crop: "bg-[-968px_-28px]" },
      { category: "Lubricant", name: "Liqui Moly Fluid And Additives", price: "Explore Brand", reviews: 4, crop: "bg-[-1318px_-37px]" },
    ],
  },
  modification: {
    eyebrow: "Custom Upgrade",
    title: "Modification",
    highlight: "Parts",
    description: "Demo modification accessories for styling, utility, lighting and performance-focused car upgrades.",
    filters: ["All", "Lighting", "Exterior", "Interior", "Performance"],
    products: [
      { category: "Lighting", name: "LED Headlight Upgrade Kit", price: "Tk 4,500.00", reviews: 4, crop: "bg-[-1318px_-506px]" },
      { category: "Exterior", name: "Sport Styling Side Skirt Set", price: "Tk 7,900.00", reviews: 3, crop: "bg-[-968px_-506px]" },
      { category: "Interior", name: "Premium Carbon Dashboard Trim", price: "Tk 2,650.00", reviews: 5, image: "/accessory-yesido-wireless-holder.jpeg" },
      { category: "Performance", name: "Performance Intake Cleaner Kit", price: "Tk 1,450.00", reviews: 6, image: "/accessory-ac-pro.jpeg" },
      { category: "Exterior", name: "Universal Front Lip Spoiler", price: "Tk 3,250.00", reviews: 4, crop: "bg-[-618px_-506px]" },
      { category: "Lighting", name: "Fog Lamp Brightness Upgrade", price: "Tk 3,900.00", reviews: 2, crop: "bg-[-1318px_-506px]" },
    ],
  },
  "combo-package": {
    eyebrow: "Bundle Deals",
    title: "Combo Package",
    highlight: "Offers",
    description: "Value demo bundles for cleaning, safety, phone accessories, lubricant care and maintenance.",
    filters: ["All", "Care Combo", "Safety Combo", "Phone Combo", "Maintenance"],
    products: [
      { category: "Care Combo", name: "Complete Car Wash And Wax Combo", price: "Tk 1,650.00", reviews: 7, image: "/accessory-hard-wax.jpeg" },
      { category: "Care Combo", name: "AC Cleaner And Air Freshener Combo", price: "Tk 990.00", reviews: 6, image: "/accessory-ac-pro.jpeg" },
      { category: "Phone Combo", name: "Car Holder And Fast Charger Combo", price: "Tk 2,350.00", reviews: 5, image: "/accessory-joyroom-holder.jpeg" },
      { category: "Maintenance", name: "Engine Flush And Fuel Cleaner Combo", price: "Tk 2,250.00", reviews: 4, crop: "bg-[-968px_-28px]" },
      { category: "Safety Combo", name: "Emergency Road Safety Combo", price: "Tk 1,950.00", reviews: 5, image: "/accessory-wide-angle-holder.jpeg" },
      { category: "Maintenance", name: "Washer Fluid And Microfiber Combo", price: "Tk 780.00", reviews: 8, image: "/accessory-windshield-washer.jpeg" },
    ],
  },
};

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Stars({ count }) {
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
          className="absolute bottom-9 left-1/2 z-10 flex h-[39px] min-w-[126px] -translate-x-1/2 translate-y-3 items-center justify-center rounded-full bg-black px-6 text-[13px] font-black text-white opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition duration-200 hover:bg-[#d3191d] group-hover/product:translate-y-0 group-hover/product:opacity-100"
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
        <div className="mt-[12px] flex items-center gap-2">
          <p className="text-[18px] font-black leading-none text-[#ff5145]">{product.price}</p>
          {product.oldPrice && <p className="text-[14px] font-bold leading-none text-[#6b7280] line-through">{product.oldPrice}</p>}
        </div>
      </div>
    </article>
  );
}

export default function CollectionPageClient({ pageKey }) {
  const data = pageData[pageKey] || pageData["sale-offer"];
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [addedItems, setAddedItems] = useState([]);

  const filteredProducts = useMemo(() => {
    return data.products.filter((product) => {
      const matchesFilter = activeFilter === "All" || product.category === activeFilter;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, data.products, searchTerm]);

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
              {data.eyebrow}
            </div>
            <h1 className="mt-8 text-[56px] font-black leading-none tracking-[-0.06em] text-[#111827] max-lg:text-[44px] max-sm:text-[34px]">
              {data.title} <span className="text-[#df2026]">{data.highlight}</span>
            </h1>
            <span className="mx-auto mt-7 block h-1 w-24 rounded-full bg-[#ef3338]" />
            <p className="mx-auto mt-6 max-w-[760px] text-[19px] leading-8 text-[#4b5563] max-sm:text-[15px]">{data.description}</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-9 rounded-[14px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center gap-3">
              {data.filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`inline-flex h-11 shrink-0 items-center rounded-full border px-5 text-[14px] font-black transition ${
                    activeFilter === filter
                      ? "border-[#ef3338] bg-[#ef3338] text-white shadow-[0_12px_24px_rgba(220,38,38,0.2)]"
                      : "border-[#ef3338]/30 bg-white text-[#263755] hover:border-[#ef3338] hover:bg-[#fff6f6] hover:text-[#df2026]"
                  }`}
                >
                  {filter}
                </button>
              ))}
              <div className="ml-auto min-w-[260px] max-sm:ml-0 max-sm:w-full">
                <label className="sr-only" htmlFor={`${pageKey}-search`}>Search products</label>
                <input
                  id={`${pageKey}-search`}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-11 w-full rounded-full border border-[#d7dce4] px-5 text-[14px] font-semibold text-[#111827] outline-none transition placeholder:text-[#8b95a5] focus:border-[#ef3338] focus:ring-4 focus:ring-[#ef3338]/10"
                  placeholder={`Search ${data.title.toLowerCase()}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-x-[20px] gap-y-[44px] max-2xl:grid-cols-5 max-xl:grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {filteredProducts.map((product) => (
              <ProductCard key={product.name} product={product} isAdded={addedItems.includes(product.name)} onAdd={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
