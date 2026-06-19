"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FooterVehicleFitmentLink from "./FooterVehicleFitmentLink";

const footerColumns = [
  {
    title: "Shop Parts",
    links: [
      ["All Collections", "/#featured-products"],
      ["Browse Products", "/#parts"],
      ["Deals & Offers", "/offers"],
      ["Sale Items", "/#featured-products"],
      ["Search Parts", "/parts-quote"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About JPSPARE", "/about"],
      ["Blog & News", "/blog"],
      ["Video Gallery", "/video-gallery"],
      ["Contact Us", "/help"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Track Your Order", "/track-order"],
      ["Vehicle Fitment", "/products/hitachi-shock-absorver-b3337#compatibility"],
      ["Parts Quote", "/parts-quote"],
      ["Help Center", "/help"],
      ["Returns & Warranty", "/returns-warranty"],
      ["Privacy Policy", "/privacy-policy"],
    ],
  },
  {
    title: "My Account",
    links: [
      ["Sign In", "/signin"],
      ["Create Account", "/create-account"],
      ["My Account", "/dashboard"],
      ["Wishlist", "/wishlisht"],
      ["Shopping Cart", "/cart"],
    ],
  },
];

const paymentLabels = ["Pay", "VISA", "MC", "AMEX", "bKash", "Nagad", "Rocket", "DBBL", "AB", "City", "MTB", "UPay", "SSL"];

function FooterIcon({ name }) {
  const common = "size-4";

  if (name === "phone") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  return null;
}

export default function SiteFooter() {
  const [footerCms, setFooterCms] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("/api/homepage", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (active) setFooterCms(payload?.cms?.footer || null);
      })
      .catch(() => {
        if (active) setFooterCms(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const footerLogo = footerCms?.footerLogo || "/jpspare-logo.png";
  const aboutText = footerCms?.aboutText || "Authentic Japanese automotive parts with guaranteed quality and nationwide shipping.";
  const contact = {
    phone: footerCms?.contact?.phone || "01718914582",
    email: footerCms?.contact?.email || "info@jpspare.com.bd",
    address: footerCms?.contact?.address || "277 Tejgaon I/A, Dhaka -1208",
  };
  const socialLinks = {
    facebook: footerCms?.socialLinks?.facebook || "#social",
    instagram: footerCms?.socialLinks?.instagram || "#social",
    youtube: footerCms?.socialLinks?.youtube || "#social",
  };
  const copyrightText = footerCms?.copyrightText || "© 2024 JPSPARE. All rights reserved.";

  return (
    <footer className="mt-auto bg-[#111827] text-white">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_85%_12%,rgba(70,31,47,0.52),transparent_34%),linear-gradient(90deg,#101827,#121523)]">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-[minmax(300px,0.9fr)_minmax(0,1.8fr)] gap-10 max-lg:grid-cols-1">
            <div className="rounded-[14px] border border-white/8 bg-white/[0.035] p-6 shadow-[0_18px_46px_rgba(0,0,0,0.16)]">
              <Link href="/" className="block h-[54px] w-[132px] overflow-hidden rounded-[8px]" aria-label="JPSPARE home">
                <span className="block size-full scale-[1.7] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${footerLogo})` }} />
              </Link>
              <p className="mt-5 max-w-[420px] text-[15px] leading-[1.7] text-[#d1d5db]">
                {aboutText}
              </p>

              <div className="mt-6 grid gap-2.5 text-[14px] text-[#cfd5df]">
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 rounded-[8px] bg-[#182232] px-3 py-2 transition hover:bg-[#202b3c] hover:text-[#ff6267]">
                  <span className="text-[#ff6267]"><FooterIcon name="phone" /></span>
                  {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 rounded-[8px] bg-[#182232] px-3 py-2 transition hover:bg-[#202b3c] hover:text-[#ff6267]">
                  <span className="text-[#ff6267]"><FooterIcon name="mail" /></span>
                  {contact.email}
                </a>
                <p className="flex items-center gap-3 rounded-[8px] bg-[#182232] px-3 py-2">
                  <span className="text-[#ff6267]"><FooterIcon name="pin" /></span>
                  {contact.address}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
                <h3 className="text-[15px] font-black">Follow Us</h3>
                <div className="flex gap-2">
                  {[
                    ["f", socialLinks.facebook],
                    ["◎", socialLinks.instagram],
                    ["▶", socialLinks.youtube],
                  ].map(([item, href]) => (
                    <a
                      key={item}
                      href={href}
                      className="grid size-9 place-items-center rounded-[8px] bg-[#1d2735] text-[14px] font-black text-[#c7ced8] transition hover:bg-[#ef3338] hover:text-white"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
              {footerColumns.map((column) => (
                <div key={column.title} className="rounded-[12px] border border-white/7 bg-white/[0.025] p-5">
                  <h3 className="text-[16px] font-black">{column.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {column.links.map(([label, href], index) => (
                      <li key={label}>
                        {label === "Vehicle Fitment" ? (
                          <FooterVehicleFitmentLink className="text-[14px] text-[#c9ced8] transition hover:text-[#ff6267]">
                            {label}
                          </FooterVehicleFitmentLink>
                        ) : (
                          <Link
                            href={href}
                            className={[
                              "inline-flex items-center text-[14px] text-[#c9ced8] transition hover:translate-x-0.5 hover:text-[#ff6267]",
                              column.title === "Shop Parts" && index === 1 ? "font-semibold text-[#ff6267]" : "",
                            ].join(" ")}
                          >
                            {label}
                            {column.title === "Shop Parts" && index === 1 ? <span className="ml-2">›</span> : null}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/7 px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 max-lg:flex-col">
            <p className="text-[14px] text-[#aeb5c1]">{copyrightText}</p>
            <span className="inline-flex items-center gap-2 text-[15px] text-[#cfd5df]">
              <span className="text-[#16c784]"><FooterIcon name="check" /></span>
              Secure payments:
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {paymentLabels.map((label) => (
                <span key={label} className="grid h-[22px] min-w-[32px] place-items-center rounded-[2px] bg-white px-1 text-[7px] font-black text-[#1f2937]">
                  {label}
                </span>
              ))}
              <span className="grid h-[22px] min-w-[86px] place-items-center rounded-[2px] bg-[#235aa0] px-2 text-[8px] font-black text-white">
                SSL-COMMERZ
              </span>
            </div>
            <div className="flex gap-6 text-[14px] text-[#aeb5c1]">
              <Link href="/privacy-policy" className="transition hover:text-[#ff6267]">Privacy</Link>
              <Link href="/#terms" className="transition hover:text-[#ff6267]">Terms</Link>
              <Link href="/#cookies" className="transition hover:text-[#ff6267]">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
