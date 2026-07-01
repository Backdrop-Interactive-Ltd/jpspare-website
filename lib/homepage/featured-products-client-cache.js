"use client";

let featuredProductsDataPromise = null;
let featuredProductsData = null;

export function getHomepageFeaturedProductsClientData() {
  if (featuredProductsData) return Promise.resolve(featuredProductsData);
  if (featuredProductsDataPromise) return featuredProductsDataPromise;

  featuredProductsDataPromise = fetch("/api/homepage/featured-products", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => {
      featuredProductsData = payload;
      return payload;
    })
    .catch(() => null)
    .finally(() => {
      featuredProductsDataPromise = null;
    });

  return featuredProductsDataPromise;
}
