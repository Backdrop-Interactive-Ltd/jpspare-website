import Link from "next/link";
import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import { getHomepageCms } from "@/lib/homepage/cms";

const fallbackMetadata = {
  title: "Returns & Warranty | JPSPARE",
  description: "JPSPARE returns, warranty, shipping, inspection, and support policy.",
};

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const returnsWarranty = await getReturnsWarrantyCms();

  return {
    title: returnsWarranty.seo?.metaTitle || fallbackMetadata.title,
    description: returnsWarranty.seo?.metaDescription || fallbackMetadata.description,
  };
}

const policyCards = [
  {
    title: "Return Eligibility",
    body: "Products may be eligible for return when they are unused, unopened, and returned with original packaging, invoice, and all included accessories.",
    bullets: ["Return request within 7 days", "Original invoice required", "Product must be resaleable"],
  },
  {
    title: "Warranty Coverage",
    body: "Warranty coverage applies only to eligible products with manufacturer or supplier warranty support.",
    bullets: ["Category-based terms", "Brand-specific coverage", "Inspection result required"],
  },
  {
    title: "Inspection Process",
    body: "All return and warranty claims are reviewed by our support team before approval.",
    bullets: ["Photos may be requested", "Installation details may be checked", "Physical inspection may apply"],
  },
  {
    title: "Replacement & Refunds",
    body: "Approved claims may be resolved through replacement, store credit, or refund depending on stock availability and claim type.",
    bullets: ["Stock availability based", "Claim type reviewed", "Timeline may vary"],
  },
  {
    title: "Shipping for Returns",
    body: "Customers should safely pack return items. For verified product fault or wrong shipment, JPSPARE will assist according to the approved claim.",
    bullets: ["Secure packaging required", "Return logistics reviewed", "Fault verification applies"],
  },
  {
    title: "Non-Returnable Items",
    body: "Installed parts, damaged packaging, used fluids, opened lubricants, custom orders, discounted clearance items, and improper installation damage are not returnable.",
    bullets: ["Installed parts excluded", "Opened fluids excluded", "Custom orders excluded"],
  },
];

const heroStats = [
  ["7", "Day Window"],
  ["OEM", "Warranty"],
  ["24/7", "Support"],
  ["May 2026", "Updated"],
];

const fallbackReturnsWarranty = {
  seo: fallbackMetadata,
  hero: {
    backLabel: "Back to Home",
    backLink: "/",
    eyebrow: "Policy Center",
    title: "Returns & Warranty",
    highlightedText: "Warranty",
    description: "Clear return, inspection, and warranty guidelines for JPSPARE products. Please review these terms before making a claim.",
  },
  stats: heroStats.map(([value, label], index) => ({ value, label, enabled: true, sortOrder: (index + 1) * 10 })),
  notice: {
    title: "Important Notice",
    description: "By purchasing from JPSPARE, you agree to our return, warranty, inspection, and support policies.",
  },
  returnPolicies: policyCards
    .filter((item) => item.title !== "Warranty Coverage")
    .map((item, index) => ({ ...item, description: item.body, enabled: true, sortOrder: (index + 1) * 10 })),
  warrantyPolicies: policyCards
    .filter((item) => item.title === "Warranty Coverage")
    .map((item, index) => ({ ...item, description: item.body, enabled: true, sortOrder: (index + 1) * 10 })),
  claimChecklist: ["Order number", "Product details", "Clear photos or videos", "Installation details if applicable"].map((label, index) => ({ label, enabled: true, sortOrder: (index + 1) * 10 })),
  supportContact: {
    eyebrow: "JPSPARE Support",
    email: "info@jpspare.com.bd",
    phone: "01718914582",
    heading: "Need Help With A Claim?",
    description: "Our support team will guide you through inspection, replacement, or warranty support.",
    buttonText: "Contact Support",
    buttonLink: "/help",
  },
  cta: {
    enabled: true,
    eyebrow: "Need Help With A Claim?",
    title: "Contact us with your order number and product details.",
    description: "Our support team will guide you through inspection, replacement, or warranty support.",
    buttonText: "Contact Support",
    buttonLink: "/help",
  },
};

async function getReturnsWarrantyCms() {
  try {
    const cms = await getHomepageCms();
    return cms?.sitePages?.returnsWarranty || fallbackReturnsWarranty;
  } catch {
    return fallbackReturnsWarranty;
  }
}

function enabledItems(items, fallback) {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source
    .filter((item) => item?.enabled !== false)
    .sort((a, b) => (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0));
}

function policyItems(returnsWarranty) {
  const returnPolicies = enabledItems(returnsWarranty.returnPolicies, fallbackReturnsWarranty.returnPolicies);
  const warrantyPolicies = enabledItems(returnsWarranty.warrantyPolicies, fallbackReturnsWarranty.warrantyPolicies);
  return [...returnPolicies, ...warrantyPolicies].sort((a, b) => (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0));
}

function renderHighlightedText(text, highlightedText, className = "text-[#ff4a50]") {
  if (!text || !highlightedText || !text.includes(highlightedText)) return text;
  const [before, after] = text.split(highlightedText);

  return (
    <>
      {before}
      <span className={className}>{highlightedText}</span>
      {after}
    </>
  );
}

function Icon({ name, className = "size-5" }) {
  const icons = {
    arrowLeft: "M19 12H5m7-7-7 7 7 7",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    document: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h4",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z",
    mail: "M4 6h16v12H4zM4 8l8 5 8-5",
    check: "M20 6 9 17l-5-5",
    clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default async function ReturnsWarrantyPage() {
  const returnsWarranty = await getReturnsWarrantyCms();
  const hero = returnsWarranty.hero || fallbackReturnsWarranty.hero;
  const stats = enabledItems(returnsWarranty.stats, fallbackReturnsWarranty.stats);
  const notice = returnsWarranty.notice || fallbackReturnsWarranty.notice;
  const checklist = enabledItems(returnsWarranty.claimChecklist, fallbackReturnsWarranty.claimChecklist);
  const supportContact = returnsWarranty.supportContact || fallbackReturnsWarranty.supportContact;
  const cta = returnsWarranty.cta || fallbackReturnsWarranty.cta;
  const cards = policyItems(returnsWarranty);

  return (
    <>
      <TopDealBar />
      <Header />
      <main className="min-h-screen bg-[#f4f6f8] text-[#111827]">
        <section className="px-4 pt-0 sm:px-6 lg:px-10">
          <div className="relative mx-auto flex min-h-[300px] w-full max-w-[1635px] items-center overflow-hidden border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] px-6 py-12 text-white sm:px-9 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
            <div className="relative flex w-full flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[820px]">
                <Link href={hero.backLink || fallbackReturnsWarranty.hero.backLink} className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.12em] text-[#ffb5b8] transition hover:text-white">
                  <Icon name="arrowLeft" className="size-4" />
                  {hero.backLabel || fallbackReturnsWarranty.hero.backLabel}
                </Link>
                <span className="mt-8 inline-flex items-center rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
                  {hero.eyebrow || fallbackReturnsWarranty.hero.eyebrow}
                </span>
                <h1 className="mt-6 text-[42px] font-black leading-tight tracking-[-0.04em] sm:text-[56px]">
                  {renderHighlightedText(hero.title || fallbackReturnsWarranty.hero.title, hero.highlightedText || fallbackReturnsWarranty.hero.highlightedText)}
                </h1>
                <p className="mt-4 max-w-[760px] text-[16px] font-medium leading-7 text-white/68">
                  {hero.description || fallbackReturnsWarranty.hero.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-white/15 bg-white/8 p-3 backdrop-blur-sm sm:grid-cols-4 lg:ml-auto lg:min-w-[520px]">
                {stats.map(({ value, label }) => (
                  <div key={label} className="rounded-[6px] bg-black/15 px-3 py-3 text-center">
                    <p className="text-[19px] font-black text-[#ff5b61]">{value}</p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto grid w-full max-w-[1635px] gap-8 lg:grid-cols-[0.34fr_0.66fr]">
            <aside className="space-y-6">
              <div className="rounded-[8px] border border-[#ffd0d2] bg-[#fff1ee] p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#ef3338] text-white">
                    <Icon name="document" />
                  </span>
                  <div>
                    <h2 className="text-[20px] font-black text-[#7c2d12]">{notice.title || fallbackReturnsWarranty.notice.title}</h2>
                    <p className="mt-3 text-[14px] font-semibold leading-7 text-[#9f1d20]">
                      {notice.description || fallbackReturnsWarranty.notice.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <h2 className="text-[20px] font-black">Claim Checklist</h2>
                <div className="mt-5 space-y-3">
                  {checklist.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-[8px] bg-[#f8fafc] px-4 py-3 text-[13px] font-bold text-[#344054]">
                      <span className="grid size-6 place-items-center rounded-full bg-[#ef3338] text-white">
                        <Icon name="check" className="size-3.5" />
                      </span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[8px] bg-[#111827] p-7 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ff8c91]">{supportContact.eyebrow || fallbackReturnsWarranty.supportContact.eyebrow}</p>
                <a href={`mailto:${supportContact.email || fallbackReturnsWarranty.supportContact.email}`} className="mt-5 flex items-center gap-3 text-[14px] font-semibold text-white/75 transition hover:text-white">
                  <Icon name="mail" className="size-4 text-[#ff5b61]" />
                  {supportContact.email || fallbackReturnsWarranty.supportContact.email}
                </a>
                <a href={`tel:${supportContact.phone || fallbackReturnsWarranty.supportContact.phone}`} className="mt-3 flex items-center gap-3 text-[14px] font-semibold text-white/75 transition hover:text-white">
                  <Icon name="phone" className="size-4 text-[#ff5b61]" />
                  {supportContact.phone || fallbackReturnsWarranty.supportContact.phone}
                </a>
              </div>
            </aside>

            <div className="grid gap-5 md:grid-cols-2">
              {cards.map((section, index) => (
                <article key={section.title} className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#ef3338]/40">
                  <div className="flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[14px] font-black text-[#ef3338]">
                      {index + 1}
                    </span>
                    <div>
                      <h2 className="text-[20px] font-black tracking-[-0.02em] text-[#111827]">{section.title}</h2>
                      <p className="mt-3 text-[14px] font-medium leading-7 text-[#526071]">{section.body || section.description}</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-2 border-t border-[#edf0f3] pt-5">
                    {(section.bullets || []).map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-[13px] font-bold text-[#667085]">
                        <Icon name="check" className="size-4 text-[#ef3338]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              <article className="rounded-[8px] border border-[#ffd0d2] bg-[#fff1ee] p-7 md:col-span-2">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ef3338]">{cta.eyebrow || supportContact.heading || fallbackReturnsWarranty.cta.eyebrow}</p>
                    <h2 className="mt-2 text-[24px] font-black">{cta.title || supportContact.heading || fallbackReturnsWarranty.cta.title}</h2>
                    <p className="mt-2 text-[14px] font-medium text-[#667085]">{cta.description || supportContact.description || fallbackReturnsWarranty.cta.description}</p>
                  </div>
                  <Link href={cta.buttonLink || supportContact.buttonLink || fallbackReturnsWarranty.cta.buttonLink} className="inline-flex h-12 shrink-0 items-center justify-center rounded-[8px] bg-[#ef3338] px-7 text-[14px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f24]">
                    {cta.buttonText || supportContact.buttonText || fallbackReturnsWarranty.cta.buttonText}
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
