"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompareHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const openComparePage = () => {
      const routes = {
        "#compare": "/compare",
        "#wishlist": "/wishlisht",
        "#signin": "/signin",
      };
      const route = routes[window.location.hash];
      if (route) router.push(route);
    };

    openComparePage();
    window.addEventListener("hashchange", openComparePage);

    return () => window.removeEventListener("hashchange", openComparePage);
  }, [router]);

  return null;
}
