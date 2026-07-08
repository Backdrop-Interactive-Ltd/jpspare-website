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

export const searchCatalogProducts = [
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
].map((product) => ({ ...product, slug: slugify(product.name) }));

export function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function searchCatalog(query, limit) {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (!terms.length) return limit ? searchCatalogProducts.slice(0, limit) : searchCatalogProducts;

  const matches = searchCatalogProducts
    .map((product) => {
      const haystack = normalize(`${product.name} ${product.category}`);
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.product.reviews - a.product.reviews)
    .map((item) => item.product);

  return limit ? matches.slice(0, limit) : matches;
}

function flattenCategories(categories = []) {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(Array.isArray(category.children) ? category.children : []),
  ]);
}

function normalizeProduct(product) {
  const categoryName = typeof product?.category === "string" ? product.category : product?.category?.name;
  const price = product?.discountPrice || product?.price || product?.compareAtPrice || "";

  return {
    ...product,
    name: product?.name || product?.title || "",
    title: product?.title || product?.name || "",
    category: categoryName || "",
    price,
    image: product?.image || product?.images?.find((item) => item?.isThumbnail)?.url || product?.images?.[0]?.url || "",
    reviews: product?.reviews || product?.rating || 0,
  };
}

function normalizeCategory(category) {
  return {
    id: category?.id || category?.slug || category?.name,
    name: category?.name || "",
    slug: category?.slug || "",
    href: category?.slug ? `/products?category=${encodeURIComponent(category.slug)}` : "/products",
  };
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("SEARCH_FETCH_FAILED");
  return response.json();
}

export async function fetchSearchCatalog(query, options = {}) {
  const normalizedQuery = String(query || "").trim();
  const limit = Number.isFinite(options.limit) ? options.limit : undefined;
  const fallbackProducts = searchCatalog(normalizedQuery, limit);

  if (!normalizedQuery) {
    return {
      products: fallbackProducts,
      categories: [],
      fallback: true,
    };
  }

  try {
    const params = new URLSearchParams({
      q: normalizedQuery,
      limit: String(limit || 24),
    });
    const [productsPayload, categoriesPayload] = await Promise.all([
      fetchJson(`/api/products?${params.toString()}`, options.signal),
      fetchJson("/api/categories/tree", options.signal),
    ]);

    const products = (productsPayload?.items || productsPayload?.data || []).map(normalizeProduct).filter((product) => product.name && product.slug);
    const categories = flattenCategories(categoriesPayload?.items || categoriesPayload?.data || [])
      .map(normalizeCategory)
      .filter((category) => category.name && normalize(category.name).includes(normalize(normalizedQuery)));

    const matchedCategory = categories[0];
    if (!products.length && matchedCategory?.slug) {
      const categoryParams = new URLSearchParams({
        category: matchedCategory.slug,
        limit: String(limit || 24),
      });
      const categoryProductsPayload = await fetchJson(`/api/products?${categoryParams.toString()}`, options.signal);
      const categoryProducts = (categoryProductsPayload?.items || categoryProductsPayload?.data || [])
        .map(normalizeProduct)
        .filter((product) => product.name && product.slug);

      return {
        products: limit ? categoryProducts.slice(0, limit) : categoryProducts,
        categories,
        fallback: false,
      };
    }

    return {
      products: limit ? products.slice(0, limit) : products,
      categories,
      fallback: false,
    };
  } catch {
    return {
      products: fallbackProducts,
      categories: [],
      fallback: true,
    };
  }
}
