import Link from "next/link";
import TopDealBar from "./TopDealBar";
import ProductTabs, { BestSellingAutoParts, FeaturedOfferBanners, LatestJapaneseAutoParts } from "./ProductTabs";
import CustomerReviews from "./CustomerReviews";
import HeaderSearch from "./HeaderSearch";
import CompareHashRedirect from "./CompareHashRedirect";
import HeaderCompareButton from "./HeaderCompareButton";
import HeaderCartButton from "./HeaderCartButton";
import HeaderWishlistButton from "./HeaderWishlistButton";
import HeaderAccountButton from "./HeaderAccountButton";
import HeaderCategoryTreeClient from "./HeaderCategoryTreeClient";
import DynamicLogoMark from "./DynamicLogoMark";
import PartsInquirySection from "./PartsInquirySection";
import SlideManualControls from "./SlideManualControls";
import { MainNavBar } from "./homepage/homepage-mega-menu";
export { MainNavBar } from "./homepage/homepage-mega-menu";
import { vehicleBrands, premiumBrands, categoryShowcase, heroCategorySlider } from "./homepage/homepage-data";
import { Icon, slugify } from "./homepage/homepage-ui-helpers";


function LogoMark({ logo }) {
  return <DynamicLogoMark logo={logo} />;
}

function TopSearch({ placeholderTexts }) {
  return <HeaderSearch vehicleBrands={vehicleBrands} placeholderTexts={placeholderTexts} />;
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

function Hero() {
  const image3Slides = [
    {
      src: "/hero-image-3-slide-1.webp",
      alt: "Mobil 1 engine oil genuine product banner",
    },
    {
      src: "/hero-image-3-slide-2.webp",
      alt: "Yesido VC13 car jump starter banner",
    },
    {
      src: "/hero-image-3-slide-3.webp",
      alt: "Car cover protection service banner",
    },
  ];

  return (
    <section className="bg-[#f2f3f5] pt-0 pb-4">
      <div className="grid w-full max-w-none gap-3 bg-[#f2f3f5] md:grid-cols-[minmax(0,4fr)_minmax(220px,1fr)]">
        <section className="relative h-[220px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-[665px]" aria-label="Mobil online shopping banner">
          <img
            src="/hero-image-1-mobil-banner.webp"
            alt="Buy Mobil online with home delivery"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>
        <div className="grid h-[292px] gap-3 md:h-[665px] md:grid-rows-[1fr_2fr]">
          <section className="hero-zoom-panel relative h-[110px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-auto md:min-h-0" aria-label="Download app offer banner">
            <img
              src="/hero-image-2-app-banner.webp"
              alt="Download the app and get 250 off on your first order"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </section>
          <section className="manual-slide-shell hero-zoom-panel relative h-[170px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-auto md:min-h-0" aria-label="Promotional banner slider">
            <div className="hero-image-3-track absolute inset-0">
              {[...image3Slides, image3Slides[0]].map((slide, index) => (
                <img
                  key={`${slide.src}-${index}`}
                  src={slide.src}
                  alt={index === image3Slides.length ? "" : slide.alt}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function HeroFeatureStrip() {
  const features = [
    {
      icon: "tag",
      title: "Competitive Price",
      text: "Get The Best Prices Everyday",
    },
    {
      icon: "award",
      title: "Authentic Products",
      text: "Secured with Brand Warranty",
    },
    {
      icon: "card",
      title: "Easy & Secured Payment",
      text: "Pre-payment, Cash on Delivery",
    },
    {
      icon: "truck",
      title: "Fast Delivery",
      text: "Rapid delivery At Your Doorstep",
    },
    {
      icon: "rotate",
      title: "7-Day Easy Returns",
      text: "Hassle-free returns and replacements with full warranty",
    },
    {
      icon: "headphones",
      title: "Expert Support Team",
      text: "Professional automotive specialists available 7 days a week",
    },
  ];

  return (
    <section className="bg-[#f2f3f5] py-3">
      <div className="mx-auto grid w-[calc(100%-40px)] max-w-none grid-cols-6 gap-3 sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)] max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group/feature relative flex min-h-[66px] items-center gap-3 overflow-hidden rounded-[10px] border border-white/85 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] px-4 py-2.5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.055)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ffd2d3] hover:shadow-[0_16px_30px_rgba(239,51,56,0.10)]"
          >
            <span className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,#ff3b40,transparent)] opacity-0 transition group-hover/feature:opacity-100" />
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#f7f7fa] text-[#ef3338] shadow-[inset_0_0_0_1px_#eceef3] transition group-hover/feature:bg-white group-hover/feature:shadow-[inset_0_0_0_1px_#ffd2d3,0_8px_18px_rgba(239,51,56,0.10)]">
              <Icon name={feature.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[16px] font-semibold leading-tight text-[#111827]">{feature.title}</span>
              <span className="mt-1 block text-[13px] font-medium leading-snug text-[#8a93a3]">{feature.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroCategorySlider() {
  return (
    <section className="bg-transparent pt-2 pb-3">
      <div className="w-full max-w-none">
        <div className="manual-slide-shell category-marquee relative overflow-hidden rounded-[10px] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="category-marquee-track flex w-max items-center">
            {[0, 1, 2, 3].map((group) => (
              <div key={group} className="flex shrink-0 items-center gap-2 pr-2">
                {heroCategorySlider.map((item) => (
                  <a
                    key={`${item.label}-${group}`}
                    href={item.href}
                    className="flex h-9 shrink-0 items-center gap-2 rounded-[4px] bg-[#ffe5ee] px-3.5 text-[14px] font-black leading-none text-[#2b2529] shadow-[inset_0_0_0_1px_rgba(255,216,226,0.9)] transition hover:bg-[#ffd5e3] hover:text-[#d41667]"
                  >
                    <span className="text-[17px] leading-none">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase() {
  return (
    <section id="categories" className="bg-transparent pt-3 pb-4 max-sm:py-3">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          HANDPICKED CATAGORIES
        </div>
        <a
          href="/category"
          className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-[7px] bg-[#ef3338] px-4 text-[11px] font-black leading-none !text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d] hover:shadow-[0_10px_20px_rgba(239,51,56,0.18)]"
        >
          View all
        </a>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-7 lg:w-[calc(100%-80px)] lg:p-10">
        <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
          {categoryShowcase.map((group) => (
            <article key={group.title} className={`group/showcase relative overflow-hidden rounded-[8px] border p-6 shadow-[0_10px_24px_rgba(15,23,42,0.045)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:opacity-0 before:transition-opacity hover:-translate-y-0.5 hover:before:opacity-100 ${group.theme.card}`}>
              <div className="mb-[14px] flex items-center justify-between gap-3">
                <h2 className={`min-w-0 truncate text-[15px] font-black leading-5 transition ${group.theme.title}`}>{group.title}</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {group.items.map((item) => (
                  <a key={item.label} href={`#${slugify(item.label)}`} className="group/category block">
                    <div className={`relative h-[150px] overflow-hidden rounded-[7px] bg-[#f5f6f8] bg-[url('/japanparts-reference.png')] bg-[length:1920px_957px] bg-no-repeat shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)] ${item.crop} ${group.theme.itemStroke} transition duration-200 after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_45%,rgba(17,24,39,0.18)_100%)] after:opacity-0 after:transition group-hover/category:scale-[1.015] group-hover/category:shadow-[0_10px_22px_rgba(15,23,42,0.14)] group-hover/category:after:opacity-100 max-sm:h-[170px]`} />
                    <p className="mt-[7px] truncate text-[14px] font-semibold leading-5 text-[#4b5563] transition group-hover/category:text-[#ef3338]">{item.label}</p>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumAuthenticVideoSection() {
  return (
    <section className="bg-transparent py-5 max-sm:py-4">
      <div className="mx-auto w-[calc(100%-40px)] max-w-none sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="relative min-h-[430px] w-full overflow-hidden rounded-[12px] bg-[#050505] sm:min-h-[500px] lg:min-h-[560px]">
          <img
            src="/jpspare-hero-slide-1.gif"
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.18),rgba(0,0,0,0.74))]" />
          <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 mx-auto flex min-h-[430px] w-full max-w-none flex-col items-center justify-center px-4 py-16 text-center text-white sm:min-h-[500px] lg:min-h-[560px]">
            <h2 className="text-[34px] font-black uppercase leading-[1.05] tracking-[0.02em] text-white sm:text-[46px] lg:text-[64px]">
              100% Premium & Authentic
            </h2>
            <p className="mt-6 max-w-[650px] text-[15px] font-bold leading-7 text-white sm:text-[17px]">
              All our products are premium branded and 100% authentic. Whatever you buy it will work.
            </p>
            <Link
              href="/products"
              className="mt-10 inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-white px-8 text-[15px] font-bold leading-none !text-[#111827] shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition duration-200 hover:scale-[1.03] hover:bg-[#fff2f2] hover:shadow-[0_18px_38px_rgba(239,51,56,0.2)]"
            >
              Explore More
              <Icon name="arrow" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumBrandsSection() {
  return (
    <section id="brands" className="bg-transparent py-6 max-sm:py-4">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          PREMIUM PARTNERS
        </div>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)] lg:p-8">
        <div className="manual-slide-shell brand-marquee pb-5 pt-3 text-left" data-loop-copies="4">
          <SlideManualControls step={4} />
          <div className="brand-marquee-track flex w-max gap-8 max-sm:gap-4">
          {[...premiumBrands, ...premiumBrands, ...premiumBrands, ...premiumBrands].map((brand, index) => (
            <a
              key={`${brand.name}-${index}`}
              href={`#${slugify(brand.name)}`}
              className="group/brand relative flex h-[94px] w-[128px] shrink-0 flex-col items-center justify-center rounded-[10px] border border-[#dfe4ea] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)]"
            >
              <span className="absolute right-1 top-1 size-3 rounded-full border-2 border-white bg-[#20c86b]" />
              <span className={`grid h-8 min-w-[60px] place-items-center rounded-[4px] px-2 text-[13px] font-black ${brand.color}`}>{brand.short}</span>
              <span className="mt-3 text-[12px] font-black text-[#1f2937] transition group-hover/brand:text-[#d3191d]">{brand.name}</span>
            </a>
          ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f2f3f5] text-[#111827]">
      <CompareHashRedirect />
      <TopDealBar />
      <Header />
      <Hero />
      <HeroFeatureStrip />
      <CategoryShowcase />
      <LatestJapaneseAutoParts />
      <HeroCategorySlider />
      <section className="bg-transparent py-4">
        <div className="mx-auto w-[calc(100%-40px)] max-w-none sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
          <FeaturedOfferBanners />
        </div>
      </section>
      <ProductTabs />
      <PremiumAuthenticVideoSection />
      <BestSellingAutoParts />
      <PremiumBrandsSection />
      <CustomerReviews />
      <PartsInquirySection />
      <section id="parts" className="sr-only">
        <h2>Demo parts results</h2>
      </section>
      <section id="track-order" className="sr-only">
        <h2>Track order demo section</h2>
      </section>
    </main>
  );
}
