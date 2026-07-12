const RECENTLY_VIEWED_STORAGE_KEY = "jpspare_recently_viewed_v1";
const MAX_RECENTLY_VIEWED_PRODUCTS = 12;

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStoredProducts() {
  if (!canUseLocalStorage()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredProducts(products) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // localStorage can be blocked or full; recently viewed should fail silently.
  }
}

function cleanText(value) {
  const text = String(value || "").trim();
  return text || null;
}

function getProductIdentifier(product) {
  return cleanText(product?.id) || cleanText(product?.slug);
}

function isSameProduct(product, identifier) {
  const cleanIdentifier = cleanText(identifier);
  if (!cleanIdentifier) return false;
  return cleanText(product?.id) === cleanIdentifier || cleanText(product?.slug) === cleanIdentifier;
}

function normalizeProductSnapshot(product) {
  const id = cleanText(product?.id);
  const slug = cleanText(product?.slug);
  const name = cleanText(product?.name || product?.title);

  if ((!id && !slug) || !name) return null;

  return {
    id,
    slug,
    name,
    price: product?.price ?? null,
    comparePrice: product?.comparePrice ?? product?.compareAtPrice ?? product?.oldPrice ?? null,
    image: cleanText(product?.image || product?.imageUrl || product?.thumbnailUrl),
    brand: product?.brand?.name ? product.brand.name : cleanText(product?.brand),
    category: product?.category?.name ? product.category.name : cleanText(product?.category),
    viewedAt: new Date().toISOString(),
  };
}

export function getRecentlyViewedProducts() {
  return readStoredProducts()
    .map((product) => normalizeProductSnapshot(product))
    .filter(Boolean)
    .slice(0, MAX_RECENTLY_VIEWED_PRODUCTS);
}

export function addRecentlyViewedProduct(product) {
  const snapshot = normalizeProductSnapshot(product);
  if (!snapshot) return getRecentlyViewedProducts();

  const identifier = getProductIdentifier(snapshot);
  const nextProducts = [
    snapshot,
    ...getRecentlyViewedProducts().filter((item) => !isSameProduct(item, identifier)),
  ].slice(0, MAX_RECENTLY_VIEWED_PRODUCTS);

  writeStoredProducts(nextProducts);
  return nextProducts;
}

export function removeRecentlyViewedProduct(identifier) {
  const nextProducts = getRecentlyViewedProducts().filter((product) => !isSameProduct(product, identifier));
  writeStoredProducts(nextProducts);
  return nextProducts;
}

export function clearRecentlyViewedProducts() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
  } catch {
    // localStorage can be blocked; clearing recently viewed should fail silently.
  }
}
