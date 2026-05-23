"use client";

import { usePathname } from "next/navigation";
import BackToTopButton from "./BackToTopButton";
import SiteFooter from "./SiteFooter";

export default function PublicChrome() {
  const pathname = usePathname();

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
