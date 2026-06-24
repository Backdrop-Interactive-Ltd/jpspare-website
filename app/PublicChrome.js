"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BackToTopButton from "./BackToTopButton";
import SiteFooter from "./SiteFooter";

function CartSuccessToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;

    function handleToast(event) {
      window.clearTimeout(timer);
      setToast({
        id: Date.now(),
        message: event.detail?.message || "Product added to cart",
      });
      timer = window.setTimeout(() => setToast(null), 2600);
    }

    window.addEventListener("jpspare-cart-toast", handleToast);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("jpspare-cart-toast", handleToast);
    };
  }, []);

  if (!toast) return null;

  return (
    <div key={toast.id} className="fixed right-5 top-5 z-[1200] animate-[cartSuccessToast_260ms_ease-out] rounded-[10px] border border-[#b8f0c9] bg-white px-4 py-3 text-[#1f2937] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
      <div className="flex items-center gap-3">
        <span className="grid size-6 place-items-center rounded-full bg-[#38c95d] text-white shadow-[0_8px_18px_rgba(34,197,94,0.26)]">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="text-[15px] font-black">{toast.message}</span>
      </div>
    </div>
  );
}

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
      <CartSuccessToast />
      <SiteFooter />
      <BackToTopButton />
    </>
  );
}
