"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DynamicLogoMark({ logo }) {
  const [logoSrc, setLogoSrc] = useState(logo || "/jpspare-logo-wide-clean.png");

  useEffect(() => {
    if (logo) {
      setLogoSrc(logo);
      return undefined;
    }

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
    <Link href="/" className="jpspare-logo-sweep block h-16 w-[178px] shrink-0 transition-transform duration-300 hover:scale-[1.035]" aria-label="JPSPARE home">
      <img src={logoSrc} alt="JPSPARE" className="h-full w-full object-contain" />
    </Link>
  );
}
