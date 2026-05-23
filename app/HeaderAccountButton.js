"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function UserIcon({ className = "size-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}

export default function HeaderAccountButton() {
  const [href, setHref] = useState("/signin");

  useEffect(() => {
    const syncAuthRoute = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (response.ok) {
          localStorage.setItem("jpspare-auth", "true");
          setHref("/account");
          return;
        }
      } catch {}
      setHref(localStorage.getItem("jpspare-auth") === "true" ? "/account" : "/signin");
    };

    syncAuthRoute();
    window.addEventListener("storage", syncAuthRoute);
    window.addEventListener("jpspare-auth-change", syncAuthRoute);

    return () => {
      window.removeEventListener("storage", syncAuthRoute);
      window.removeEventListener("jpspare-auth-change", syncAuthRoute);
    };
  }, []);

  return (
    <Link href={href} aria-label={href === "/account" ? "Account dashboard" : "Sign in"} className="header-action-icon">
      <UserIcon />
    </Link>
  );
}
