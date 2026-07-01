"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FooterVehicleFitmentLink from "./FooterVehicleFitmentLink";
import { getHomepageClientData } from "@/lib/homepage/client-cache";

const footerColumns = [
  {
    title: "Shop Parts",
    links: [
      ["All Collections", "/collection"],
      ["Browse Products", "/products"],
      ["Deals & Offers", "/offers"],
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
const footerAboutText = "Building Bangladesh's most trusted online marketplace for genuine car parts, premium automotive accessories, and automotive lifestyle products—delivering authenticity, competitive prices, and a seamless shopping experience.";
const footerAddress = "167/3/c/3, Mollapara, Taltola, Sher-E-Bangla Nagor, Dhaka-1207";
const footerPhoneNumbers = ["09617226688", "01718914582"];

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

    getHomepageClientData()
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

  const footerLogo = "/jpspare-logo-wide-clean.png";
  const aboutText = footerAboutText;
  const contact = {
    phone: footerCms?.contact?.phone || "01718914582",
    email: footerCms?.contact?.email || "info@jpspare.com.bd",
    address: footerAddress,
  };
  const phoneNumbers = Array.from(new Set([...footerPhoneNumbers, contact.phone, footerCms?.contact?.secondaryPhone].filter(Boolean)));
  const mapQuery = encodeURIComponent(contact.address);
  const socialLinks = {
    facebook: footerCms?.socialLinks?.facebook || "#social",
    instagram: footerCms?.socialLinks?.instagram || "#social",
    youtube: footerCms?.socialLinks?.youtube || "#social",
    tiktok: footerCms?.socialLinks?.tiktok || "#social",
  };
  const footerBottomImage = footerCms?.bottomImage || "/footer-ssl-payment.jpg";

  return (
    <footer className="mt-auto border-t-[6px] border-[#ef3338] bg-[#f4f6f9] text-[#111827]">
      <div className="footer-commerce-texture relative overflow-hidden bg-[#f4f6f9] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1635px] pb-4 pt-7">
          <div className="grid grid-cols-[minmax(300px,0.82fr)_minmax(0,1.78fr)] gap-5 max-lg:grid-cols-1">
            <div className="flex h-full flex-col py-5 pr-5 max-lg:p-0">
              <Link href="/" className="inline-flex h-[82px] w-[300px] max-w-full items-center rounded-[8px]" aria-label="JPSPARE home">
                <img
                  src={footerLogo}
                  alt="JPSPARE"
                  className="h-auto w-full object-contain object-left"
                  style={{ filter: "brightness(0) saturate(100%) invert(8%) sepia(20%) saturate(1055%) hue-rotate(180deg) brightness(95%) contrast(95%)" }}
                />
              </Link>
              <p className="mt-4 max-w-[560px] text-[14px] leading-[1.6] text-[#6f7785]">
                {aboutText}
              </p>

              <div className="mt-5 grid gap-2 text-[13px] text-[#6f7785]">
                <div className="flex select-text items-center gap-3 rounded-[7px] bg-white/60 px-3 py-2">
                  <span className="text-[#ff6267]"><FooterIcon name="phone" /></span>
                  <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    {phoneNumbers.map((phone, index) => (
                      <span key={phone} className="inline-flex items-center">
                        <a href={`tel:${phone.replace(/\s+/g, "")}`} className="transition hover:text-[#ff6267]">
                          {phone}
                        </a>
                        {index < phoneNumbers.length - 1 ? <span>,</span> : null}
                      </span>
                    ))}
                  </span>
                </div>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 rounded-[7px] bg-white/60 px-3 py-2 transition hover:bg-white hover:text-[#ff6267]">
                  <span className="text-[#ff6267]"><FooterIcon name="mail" /></span>
                  {contact.email}
                </a>
                <p className="flex items-center gap-3 rounded-[7px] bg-white/60 px-3 py-2">
                  <span className="text-[#ff6267]"><FooterIcon name="pin" /></span>
                  {contact.address}
                </p>
                <div className="relative overflow-hidden rounded-[10px] border border-[#111827]/10 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.06)]">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute left-3 top-3 z-10 rounded-[4px] bg-white px-3 py-1.5 text-[11px] font-bold text-[#1a73e8] shadow-[0_4px_12px_rgba(17,24,39,0.12)] transition hover:text-[#ef3338]"
                  >
                    Open in Maps
                  </a>
                  <iframe
                    title="JPSPARE location map"
                    src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="h-[160px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col self-stretch">
              <div className="grid grid-cols-4 gap-4 px-4 pb-5 pt-[96px] max-xl:grid-cols-2 max-lg:pt-4 max-sm:grid-cols-1">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-[15px] font-black">{column.title}</h3>
                    <ul className="mt-4 space-y-2">
                      {column.links.map(([label, href], index) => (
                        <li key={label}>
                          {label === "Vehicle Fitment" ? (
                            <FooterVehicleFitmentLink className="group inline-flex items-center text-[13px] text-[#6f7785] opacity-50 transition hover:translate-x-0.5 hover:!text-[#ef3338] hover:opacity-100">
                              <span>{label}</span>
                              <span className="ml-2 opacity-0 transition group-hover:!text-[#ef3338] group-hover:opacity-100">›</span>
                            </FooterVehicleFitmentLink>
                          ) : (
                            <Link
                              href={href}
                              className="group inline-flex items-center text-[13px] text-[#6f7785] opacity-50 transition hover:translate-x-0.5 hover:!text-[#ef3338] hover:opacity-100"
                            >
                              <span>{label}</span>
                              <span className="ml-2 opacity-0 transition group-hover:!text-[#ef3338] group-hover:opacity-100">›</span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex flex-1 items-center pb-3">
                <div className="mx-4 flex min-h-[52px] flex-1 flex-wrap items-center justify-center gap-x-8 gap-y-2 border-y border-[#111827]/10 text-[14px] font-medium text-[#364152]">
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    {["3000+ Accessories", "98% Satisfaction", "24/7 Support"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="size-4 text-[#00c48c]" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M20 6 9 17l-5-5" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex -translate-y-5 items-end justify-center gap-4 pt-0 max-xl:flex-wrap max-xl:translate-y-0">
                <div className="w-[250px] shrink-0">
                  <div className="flex items-center gap-2">
                    <a href="#app" aria-label="Download on the App Store" className="block flex-1 transition duration-300 ease-out hover:scale-[1.06]">
                      <img src="/footer-app-store-badge.png" alt="Download on the App Store" className="h-auto w-full object-contain" />
                    </a>
                    <a href="#app" aria-label="Get it on Google Play" className="block flex-1 transition duration-300 ease-out hover:scale-[1.06]">
                      <img src="/footer-google-play-badge.png" alt="Get it on Google Play" className="h-auto w-full object-contain" />
                    </a>
                  </div>
                </div>
                <div className="flex items-end justify-center gap-4">
                  <div className="max-w-[210px] shrink-0 pb-1 text-left text-[#6f7785]">
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-[#00c48c]" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M20 6 9 17l-5-5" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      <span className="text-[15px] font-bold leading-tight">Secure payments</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-[#8b93a1]">
                      Safe, encrypted, and trusted payment solutions for every purchase.
                    </p>
                  </div>
                  <div className="flex aspect-[1280/143] w-full max-w-[610px] items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-white/12 bg-white text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    {footerBottomImage ? (
                      <img
                        src={footerBottomImage}
                        alt="Footer promotional banner"
                        className="size-full object-contain"
                        style={{ filter: "contrast(1.08) saturate(1.08) brightness(1.02)" }}
                      />
                    ) : (
                      <span>Footer image area 1280 x 143</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#111827]/10 py-3">
          <div className="mx-auto grid w-full max-w-[1635px] grid-cols-3 items-center gap-6 max-md:grid-cols-1">
            <div className="flex items-center gap-1 max-md:justify-center">
              {[
                ["Facebook", socialLinks.facebook, "/footer-social-facebook.png"],
                ["Instagram", socialLinks.instagram, "/footer-social-instagram.png"],
                ["YouTube", socialLinks.youtube, "/footer-social-youtube.png"],
                ["TikTok", socialLinks.tiktok, "/footer-social-tiktok.png"],
              ].map(([label, href, icon]) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-7 place-items-center rounded-[8px] opacity-40 transition hover:scale-110 hover:opacity-100"
                >
                  <img src={icon} alt="" className="size-6 object-contain" />
                </a>
              ))}
            </div>
            <p className="text-center text-[13px] text-[#8b93a1]">
              © 2026 JPSPARE. All rights reserved. | Developed by{" "}
              <a href="https://backdropinteractive.com/" target="_blank" rel="noreferrer" className="footer-credit-link">
                Backdrop Interactive
              </a>
            </p>
            <div aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
}
