"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BackToTopButton from "./BackToTopButton";
import SiteFooter from "./SiteFooter";

export default function PublicChrome() {
  const pathname = usePathname();

  useEffect(() => {
    let scrollTimer;

    function handleScroll() {
      document.documentElement.classList.add("is-scrolling");
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 80);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.clearTimeout(scrollTimer);
      document.documentElement.classList.remove("is-scrolling");
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <SiteFooter />
      <BackToTopButton />
    </>
  );
}
