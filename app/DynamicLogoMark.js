"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHomepageClientData } from "@/lib/homepage/client-cache";

export default function DynamicLogoMark({ logo }) {
  const [logoSrc, setLogoSrc] = useState(logo || "/jpspare-logo-wide-clean.png");

  useEffect(() => {
    if (logo) return undefined;

    let mounted = true;

    getHomepageClientData()
      .then((payload) => {
        if (!mounted) return;
        const cmsLogo = payload?.cms?.header?.logo;
        if (cmsLogo) setLogoSrc(cmsLogo);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [logo]);

  return (
    <Link href="/" className="header-logo-mark relative block h-[84px] w-[256px] shrink-0 overflow-hidden rounded-[8px] transition-transform duration-300 max-lg:h-[72px] max-lg:w-[214px] max-sm:h-[64px] max-sm:w-[188px]" aria-label="JPSPARE home">
      <img src={logo || logoSrc} alt="JPSPARE" className="h-full w-full object-contain" />
    </Link>
  );
}
