import Link from "next/link";
import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import { defaultHomepageCms, getHomepageCms } from "@/lib/homepage/cms";

const fallbackShipping = defaultHomepageCms.sitePages.shipping;
const fallbackMetadata = fallbackShipping.seo;

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const shipping = await getShippingCms();

  return {
    title: shipping.seo?.metaTitle || shipping.seo?.title || fallbackMetadata.metaTitle || fallbackMetadata.title,
    description: shipping.seo?.metaDescription || shipping.seo?.description || fallbackMetadata.metaDescription || fallbackMetadata.description,
  };
}

async function getShippingCms() {
  try {
    const cms = await getHomepageCms();
    return cms?.sitePages?.shipping || fallbackShipping;
  } catch {
    return fallbackShipping;
  }
}

function enabledItems(items, fallback) {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source
    .filter((item) => item?.enabled !== false)
    .sort((a, b) => (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0));
}

function Icon({ name, className = "size-5" }) {
  const icons = {
    arrowLeft: "M19 12H5m7-7-7 7 7 7",
    truck: "M3 6h12v10H3V6Zm12 4h4l2 3v3h-6v-6ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    check: "M20 6 9 17l-5-5",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default async function ShippingPage() {
  const shipping = await getShippingCms();
  const hero = shipping.hero || fallbackShipping.hero;
  const sections = enabledItems(shipping.sections, fallbackShipping.sections);
  const cta = shipping.cta || fallbackShipping.cta;

  return (
    <>
      <TopDealBar />
      <Header />
      <main className="min-h-screen bg-[#f4f6f8] text-[#111827]">
        <section className="px-4 pt-0 sm:px-6 lg:px-10">
          <div className="relative mx-auto flex min-h-[300px] w-full max-w-[1635px] items-center overflow-hidden border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] px-6 py-12 text-white sm:px-9 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
            <div className="relative max-w-[860px]">
              <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.12em] text-[#ffb5b8] transition hover:text-white">
                <Icon name="arrowLeft" className="size-4" />
                Back to Home
              </Link>
              <span className="mt-8 inline-flex items-center rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
                {hero.eyebrow || hero.subtitle || fallbackShipping.hero.eyebrow}
              </span>
              <h1 className="mt-6 text-[42px] font-black leading-tight tracking-[-0.04em] sm:text-[56px]">{hero.title || fallbackShipping.hero.title}</h1>
              <p className="mt-4 max-w-[760px] text-[16px] font-medium leading-7 text-white/68">{hero.description || fallbackShipping.hero.description}</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto grid w-full max-w-[1635px] gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
              <article key={section.title || index} className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#ef3338]/40">
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338]">
                    <Icon name="truck" className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-[20px] font-black tracking-[-0.02em] text-[#111827]">{section.title}</h2>
                    <p className="mt-3 text-[14px] font-medium leading-7 text-[#526071]">{section.description || section.body}</p>
                  </div>
                </div>
                {(section.bullets || []).length ? (
                  <ul className="mt-5 space-y-2 border-t border-[#edf0f3] pt-5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-[13px] font-bold text-[#667085]">
                        <Icon name="check" className="size-4 text-[#ef3338]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
            <article className="rounded-[8px] border border-[#ffd0d2] bg-[#fff1ee] p-7 md:col-span-2 lg:col-span-3">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ef3338]">Delivery Support</p>
                  <h2 className="mt-2 text-[24px] font-black">{cta.heading || cta.title || fallbackShipping.cta.heading}</h2>
                  <p className="mt-2 text-[14px] font-medium text-[#667085]">{cta.description || fallbackShipping.cta.description}</p>
                </div>
                <Link href={cta.buttonLink || fallbackShipping.cta.buttonLink} className="inline-flex h-12 shrink-0 items-center justify-center rounded-[8px] bg-[#ef3338] px-7 text-[14px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f24]">
                  {cta.buttonText || fallbackShipping.cta.buttonText}
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
