"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DynamicLogoMark({ logo }) {
  const [logoSrc, setLogoSrc] = useState(logo || "/jpspare-logo-wide-clean.png");

  useEffect(() => {
    if (logo) return undefined;

    let mounted = true;

    fetch("/api/homepage", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
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
    <Link href="/" className="header-logo-mark relative block h-[78px] w-[238px] shrink-0 overflow-hidden rounded-[8px] transition-transform duration-300 max-lg:h-[68px] max-lg:w-[202px] max-sm:h-[60px] max-sm:w-[176px]" aria-label="JPSPARE home">
      <img src={logo || logoSrc} alt="JPSPARE" className="h-full w-full object-contain" />
    </Link>
  );
}
