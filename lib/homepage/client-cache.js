"use client";

let homepageDataPromise = null;
let homepageData = null;

export function getHomepageClientData() {
  if (homepageData) return Promise.resolve(homepageData);
  if (homepageDataPromise) return homepageDataPromise;

  homepageDataPromise = fetch("/api/homepage", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => {
      homepageData = payload;
      return payload;
    })
    .catch(() => null)
    .finally(() => {
      homepageDataPromise = null;
    });

  return homepageDataPromise;
}
