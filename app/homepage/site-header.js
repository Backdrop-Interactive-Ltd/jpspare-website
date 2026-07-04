"use client";

import HeaderSearch from "../HeaderSearch";
import HeaderCompareButton from "../HeaderCompareButton";
import HeaderCartButton from "../HeaderCartButton";
import HeaderWishlistButton from "../HeaderWishlistButton";
import HeaderAccountButton from "../HeaderAccountButton";
import HeaderCategoryTreeClient from "../HeaderCategoryTreeClient";
import DynamicLogoMark from "../DynamicLogoMark";
import { MainNavBar } from "./homepage-mega-menu";
import { vehicleBrands } from "./homepage-data";
import { Icon } from "./homepage-ui-helpers";

export { MainNavBar } from "./homepage-mega-menu";

function LogoMark({ logo }) {
  return <DynamicLogoMark logo={logo} />;
}

function TopSearch({ placeholderTexts }) {
  return <HeaderSearch vehicleBrands={vehicleBrands} placeholderTexts={placeholderTexts} />;
}

function SearchHeaderBar({ settings }) {
  return (
    <div className="mx-auto flex h-[82px] w-full max-w-[1720px] items-center gap-10 px-5 sm:px-8 lg:px-10 max-lg:h-auto max-lg:flex-wrap max-lg:gap-4 max-lg:py-3">
      <LogoMark logo={settings?.logo} />
      <TopSearch placeholderTexts={settings?.searchPlaceholders} />
      <div className="hidden shrink-0 items-center text-white lg:ml-auto lg:flex">
        <a href="tel:09617226688" className="block translate-x-4 rounded-[8px] px-1.5 py-1 leading-none text-white">
          <span className="flex items-center gap-1.5 text-[13px] font-medium tracking-[0.085em] text-white/82">
            <Icon name="clock" className="size-3.5 text-white/72" />
            <span>Call Us (10.00am-8.00pm)</span>
          </span>
          <span className="mt-1.5 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="header-phone-ring size-4 text-[#ef3338]" fill="currentColor" aria-hidden="true">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2a1.4 1.4 0 0 1 1.42-.34c1.56.52 3.18.78 4.83.78.74 0 1.34.6 1.34 1.34v3.48c0 .74-.6 1.34-1.34 1.34C10.8 21.78 2.22 13.2 2.22 2.34 2.22 1.6 2.82 1 3.56 1h3.5c.74 0 1.34.6 1.34 1.34 0 1.65.26 3.27.78 4.83.16.49.04 1.03-.34 1.42l-2.22 2.2Z" />
            </svg>
            <span className="text-[24px] font-black leading-none tracking-[0.02em] text-white">09617 22 66 88</span>
          </span>
        </a>
      </div>
      <span className="hidden h-8 w-px shrink-0 bg-[#111827] lg:block" />
      <div className="hidden items-center gap-6 text-white lg:flex">
        <HeaderWishlistButton />
        <HeaderCompareButton />
        <HeaderCartButton />
        <HeaderAccountButton />
      </div>
      <button className="ml-auto hidden text-white max-lg:block" aria-label="Open menu">
        <Icon name="menu" className="size-7" />
      </button>
    </div>
  );
}

export function Header({ settings }) {
  return (
    <>
      <div className="sticky top-0 z-[100] bg-[#111827] text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
        <SearchHeaderBar settings={settings} />
      </div>
      <MainNavBar />
      <HeaderCategoryTreeClient />
    </>
  );
}
