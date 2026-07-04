import Link from "next/link";
import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import { getHomepageCms } from "@/lib/homepage/cms";

const fallbackMetadata = {
  title: "Privacy Policy | JPSPARE",
  description: "JPSPARE privacy policy covering data collection, security, cookies, and customer rights.",
};

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const privacyPolicy = await getPrivacyPolicyCms();

  return {
    title: privacyPolicy.seo?.metaTitle || fallbackMetadata.title,
    description: privacyPolicy.seo?.metaDescription || fallbackMetadata.description,
  };
}

const policyCards = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly when you create an account, make a purchase, submit an inquiry, or contact support.",
    bullets: ["Name, email, phone, and address", "Order history and vehicle fitment details", "Search activity and basic analytics"],
  },
  {
    title: "How We Use Information",
    body: "We use collected data to provide, maintain, and improve the automotive parts shopping experience.",
    bullets: ["Process orders and delivery", "Provide support and fitment assistance", "Send account and shipment notices"],
  },
  {
    title: "Information Sharing",
    body: "We do not sell or trade your personal information. Sharing happens only when needed to operate services or comply with law.",
    bullets: ["Trusted service providers", "Legal compliance", "Business transfer if applicable"],
  },
  {
    title: "Data Security",
    body: "We apply practical security measures to protect information from unauthorized access, alteration, disclosure, or destruction.",
    bullets: ["SSL encrypted transmission", "Trusted payment providers", "Access control practices"],
  },
  {
    title: "Cookies & Tracking",
    body: "Cookies and similar tools help improve browsing, remember preferences, analyze website traffic, and improve product discovery.",
    bullets: ["Preference remembering", "Traffic analytics", "Product discovery improvement"],
  },
  {
    title: "Your Rights",
    body: "You can manage how your personal information is used by JPSPARE by contacting our support team.",
    bullets: ["Update personal information", "Request eligible data deletion", "Opt out of marketing messages"],
  },
];

const heroStats = [
  ["SSL", "Encryption"],
  ["Safe", "Payments"],
  ["No", "Data Sales"],
  ["May 2026", "Updated"],
];

const fallbackPrinciples = ["Collect only useful service data", "Protect order and account details", "Use trusted payment providers", "Support privacy requests"];

const fallbackPrivacyPolicy = {
  seo: fallbackMetadata,
  hero: {
    backLabel: "Back to Home",
    backLink: "/",
    eyebrow: "Privacy Center",
    title: "Privacy Policy",
    highlightedText: "Policy",
    description:
      "JPSPARE is committed to protecting your privacy and personal information. This policy explains how we collect, use, and safeguard your data.",
  },
  stats: heroStats.map(([value, label], index) => ({ value, label, enabled: true, sortOrder: (index + 1) * 10 })),
  principles: {
    title: "Your Privacy Matters",
    description: "We keep customer data handling clear, purposeful, and service-focused.",
    listTitle: "Data Principles",
    items: fallbackPrinciples.map((label, index) => ({ label, title: label, enabled: true, sortOrder: (index + 1) * 10 })),
  },
  contact: {
    eyebrow: "Privacy Contact",
    email: "privacy@jpspare.com.bd",
    phone: "01718914582",
  },
  policyCards: policyCards.map((card, index) => ({ ...card, enabled: true, sortOrder: (index + 1) * 10 })),
  cta: {
    enabled: true,
    eyebrow: "Transparency",
    title: "Questions about your data?",
    description: "Reach out to our privacy team for access, update, deletion, or marketing opt-out requests.",
    buttonText: "Contact Support",
    buttonLink: "/help",
  },
};

async function getPrivacyPolicyCms() {
  try {
    const cms = await getHomepageCms();
    return cms?.sitePages?.privacyPolicy || fallbackPrivacyPolicy;
  } catch {
    return fallbackPrivacyPolicy;
  }
}

function enabledItems(items, fallback) {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source
    .filter((item) => item?.enabled !== false)
    .sort((a, b) => (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0));
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
    lock: "M6 10V8a6 6 0 1 1 12 0v2M5 10h14v11H5V10Z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    eye: "M2 12s4-7 10-7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    mail: "M4 6h16v12H4zM4 8l8 5 8-5",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z",
    check: "M20 6 9 17l-5-5",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default async function PrivacyPolicyPage() {
  const privacyPolicy = await getPrivacyPolicyCms();
  const hero = privacyPolicy.hero || fallbackPrivacyPolicy.hero;
  const stats = enabledItems(privacyPolicy.stats, fallbackPrivacyPolicy.stats);
  const principles = privacyPolicy.principles || fallbackPrivacyPolicy.principles;
  const principleItems = enabledItems(principles.items, fallbackPrivacyPolicy.principles.items);
  const contact = privacyPolicy.contact || fallbackPrivacyPolicy.contact;
  const cards = enabledItems(privacyPolicy.policyCards, fallbackPrivacyPolicy.policyCards);
  const cta = privacyPolicy.cta || fallbackPrivacyPolicy.cta;

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
                <Link href={hero.backLink || fallbackPrivacyPolicy.hero.backLink} className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.12em] text-[#ffb5b8] transition hover:text-white">
                  <Icon name="arrowLeft" className="size-4" />
                  {hero.backLabel || fallbackPrivacyPolicy.hero.backLabel}
                </Link>
                <span className="mt-8 inline-flex items-center rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
                  {hero.eyebrow || fallbackPrivacyPolicy.hero.eyebrow}
                </span>
                <h1 className="mt-6 text-[42px] font-black leading-tight tracking-[-0.04em] sm:text-[56px]">
                  {renderHighlightedText(hero.title || fallbackPrivacyPolicy.hero.title, hero.highlightedText || fallbackPrivacyPolicy.hero.highlightedText)}
                </h1>
                <p className="mt-4 max-w-[760px] text-[16px] font-medium leading-7 text-white/68">
                  {hero.description || fallbackPrivacyPolicy.hero.description}
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
              <div className="rounded-[8px] border border-[#d7e7ff] bg-[#eff6ff] p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#2563eb] text-white">
                    <Icon name="shield" />
                  </span>
                  <div>
                    <h2 className="text-[20px] font-black text-[#1d4ed8]">{principles.title || fallbackPrivacyPolicy.principles.title}</h2>
                    <p className="mt-3 text-[14px] font-semibold leading-7 text-[#1d4ed8]">
                      {principles.description || fallbackPrivacyPolicy.principles.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <h2 className="text-[20px] font-black">{principles.listTitle || fallbackPrivacyPolicy.principles.listTitle}</h2>
                <div className="mt-5 space-y-3">
                  {principleItems.map((item) => (
                    <div key={item.title || item.label} className="flex items-center gap-3 rounded-[8px] bg-[#f8fafc] px-4 py-3 text-[13px] font-bold text-[#344054]">
                      <span className="grid size-6 place-items-center rounded-full bg-[#ef3338] text-white">
                        <Icon name="check" className="size-3.5" />
                      </span>
                      {item.title || item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[8px] bg-[#111827] p-7 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ff8c91]">{contact.eyebrow || fallbackPrivacyPolicy.contact.eyebrow}</p>
                <a href={`mailto:${contact.email || fallbackPrivacyPolicy.contact.email}`} className="mt-5 flex items-center gap-3 text-[14px] font-semibold text-white/75 transition hover:text-white">
                  <Icon name="mail" className="size-4 text-[#ff5b61]" />
                  {contact.email || fallbackPrivacyPolicy.contact.email}
                </a>
                <a href={`tel:${contact.phone || fallbackPrivacyPolicy.contact.phone}`} className="mt-3 flex items-center gap-3 text-[14px] font-semibold text-white/75 transition hover:text-white">
                  <Icon name="phone" className="size-4 text-[#ff5b61]" />
                  {contact.phone || fallbackPrivacyPolicy.contact.phone}
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
                      <p className="mt-3 text-[14px] font-medium leading-7 text-[#526071]">{section.body}</p>
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
                    <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ef3338]">{cta.eyebrow || fallbackPrivacyPolicy.cta.eyebrow}</p>
                    <h2 className="mt-2 text-[24px] font-black">{cta.title || fallbackPrivacyPolicy.cta.title}</h2>
                    <p className="mt-2 text-[14px] font-medium text-[#667085]">{cta.description || fallbackPrivacyPolicy.cta.description}</p>
                  </div>
                  <Link href={cta.buttonLink || fallbackPrivacyPolicy.cta.buttonLink} className="inline-flex h-12 shrink-0 items-center justify-center rounded-[8px] bg-[#ef3338] px-7 text-[14px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f24]">
                    {cta.buttonText || fallbackPrivacyPolicy.cta.buttonText}
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
