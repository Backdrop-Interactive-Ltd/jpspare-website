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
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-[1.35fr_repeat(4,1fr)] gap-14 px-4 sm:px-6 lg:px-8 xl:px-10 py-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div>
            <Link href="/" className="block size-16 overflow-hidden rounded-[8px]" aria-label="JPSPARE home">
              <span className="block size-full scale-[3.15] bg-cover bg-center" style={{ backgroundImage: `url(${footerLogo})` }} />
            </Link>
            <p className="mt-6 max-w-[360px] text-[15px] leading-[1.65] text-[#d1d5db]">
              {aboutText}
            </p>

            <h3 className="mt-7 text-[17px] font-black">Contact</h3>
            <div className="mt-4 space-y-3 text-[14px] text-[#cfd5df]">
              <a href={`tel:${contact.phone}`} className="flex items-center gap-3 transition hover:text-[#ff6267]">
                <span className="text-[#ff6267]"><FooterIcon name="phone" /></span>
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 transition hover:text-[#ff6267]">
                <span className="text-[#ff6267]"><FooterIcon name="mail" /></span>
                {contact.email}
              </a>
              <p className="flex items-center gap-3">
                <span className="text-[#ff6267]"><FooterIcon name="pin" /></span>
                {contact.address}
              </p>
            </div>

            <h3 className="mt-7 text-[17px] font-black">Follow Us</h3>
            <div className="mt-3 flex gap-2">
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

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[17px] font-black">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map(([label, href], index) => (
                  <li key={label}>
                    {label === "Vehicle Fitment" ? (
                      <FooterVehicleFitmentLink className="text-[15px] text-[#c9ced8] transition hover:text-[#ff6267]">
                        {label}
                      </FooterVehicleFitmentLink>
                    ) : (
                      <Link
                        href={href}
                        className={[
                          "text-[15px] text-[#c9ced8] transition hover:text-[#ff6267]",
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

        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 xl:px-10 py-5 text-[14px] text-[#aeb5c1] max-md:flex-col">
          <p>{copyrightText}</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition hover:text-[#ff6267]">Privacy</Link>
            <Link href="/#terms" className="transition hover:text-[#ff6267]">Terms</Link>
            <Link href="/#cookies" className="transition hover:text-[#ff6267]">Cookies</Link>
          </div>
        </div>

        <div className="border-t border-white/7 px-6 py-5">
          <div className="mx-auto flex max-w-[960px] items-center justify-center gap-3 max-sm:flex-col">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
