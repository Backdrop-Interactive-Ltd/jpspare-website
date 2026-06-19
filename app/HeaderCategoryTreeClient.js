"use client";

import { useEffect } from "react";

export default function HeaderCategoryTreeClient() {
  useEffect(() => {
    const roots = new Set(["car-accessories", "car-parts", "tyres", "lubricant"]);
    const title = (value) => String(value || "").toUpperCase();
    const href = (slug) => `/collections/${encodeURIComponent(slug)}`;

    fetch("/api/categories/tree?menu=true", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const items = Array.isArray(payload?.items) ? payload.items : [];
        if (!items.length) return;

        items.forEach((category) => {
          if (!roots.has(category.slug)) return;

          document.querySelectorAll(`[data-menu-root="${category.slug}"]`).forEach((node) => {
            node.setAttribute("href", href(category.slug));
            const label = node.querySelector("[data-menu-root-label]");
            if (label) label.textContent = title(category.name);
          });

          document.querySelectorAll(`[data-menu-view-more="${category.slug}"]`).forEach((node) => {
            node.setAttribute("href", href(category.slug));
          });

          const children = Array.isArray(category.children) ? category.children : [];
          if (!children.length) return;

          const topLabel = children.slice(0, 4).map((child) => child.name).filter(Boolean).join(" • ");
          document.querySelectorAll(`[data-menu-top-label="${category.slug}"]`).forEach((node) => {
            if (topLabel) node.textContent = topLabel;
          });

          document.querySelectorAll(`[data-menu-grid="${category.slug}"] [data-menu-card-index]`).forEach((card) => {
            const child = children[Number(card.getAttribute("data-menu-card-index"))];
            if (!child) return;

            const cardLink = card.querySelector("[data-menu-card-link]");
            if (cardLink) {
              cardLink.textContent = title(child.name);
              cardLink.setAttribute("title", child.name);
              cardLink.setAttribute("href", href(child.slug));
            }

            const subLinks = Array.isArray(child.children) ? child.children : [];
            card.querySelectorAll("[data-menu-sub-link-index]").forEach((subLink) => {
              const subCategory = subLinks[Number(subLink.getAttribute("data-menu-sub-link-index"))];
              if (!subCategory) return;
              subLink.setAttribute("href", href(subCategory.slug));
              subLink.setAttribute("title", subCategory.name);
              const label = subLink.querySelector("[data-menu-sub-link-label]");
              if (label) label.textContent = subCategory.name;
            });
          });
        });
      })
      .catch(() => {});
  }, []);

  return null;
}
