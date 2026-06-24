"use client";

export function normalizeProductForCart(product = {}) {
  return {
    productId: product.id || product.productId,
    slug: product.slug,
    title: product.title || product.name,
    name: product.name || product.title,
    price: product.price || product.discountPrice || product.salePrice || product.currentPrice,
    image: product.image || product.thumbnail || product.images?.[0],
    thumbnail: product.thumbnail || product.image || product.images?.[0],
    sku: product.sku,
    brand: product.brand?.name || product.brand,
    category: product.category?.name || product.category,
    freeDelivery: Boolean(product.freeDelivery || product.freeDeliveryEligible),
    freeDeliveryEligible: Boolean(product.freeDelivery || product.freeDeliveryEligible),
  };
}

export async function addProductToCart(product, quantity = 1) {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product: normalizeProductForCart(product), quantity }),
  });

  if (!response.ok) {
    throw new Error("Unable to add product to cart");
  }

  const data = await response.json();
  window.dispatchEvent(new CustomEvent("jpspare-cart-change", { detail: data.cart }));
  window.dispatchEvent(new CustomEvent("jpspare-cart-toast", { detail: { message: "Product added to cart" } }));
  return data.cart;
}

export async function addProductToWishlist(product) {
  const response = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizeProductForCart(product)),
  });

  if (!response.ok) {
    throw new Error("Unable to update wishlist");
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];
  window.dispatchEvent(new CustomEvent("jpspare-wishlist-change", { detail: { count: items.length, items } }));
  return data.item || items[0];
}
