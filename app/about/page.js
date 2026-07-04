import Image from "next/image";
import Link from "next/link";
import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import { getHomepageCms } from "@/lib/homepage/cms";

const fallbackMetadata = {
  title: "About JPSPARE | Authentic Japanese Automotive Parts",
  description: "Learn about JPSPARE, our quality promise, values, and commitment to authentic Japanese automotive parts in Bangladesh.",
};

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const about = await getAboutCms();

  return {
    title: about.seo?.metaTitle || fallbackMetadata.title,
    description: about.seo?.metaDescription || fallbackMetadata.description,
  };
}

const heroStats = [
  ["2018", "Serving Since"],
  ["50k+", "Monthly Readers"],
  ["13+", "Expert Articles"],
  ["24/7", "Support"],
];

const storyMilestones = [
  ["01", "Founded With Purpose", "Built to make verified Japanese automotive parts easier to source in Bangladesh."],
  ["02", "Quality First", "Every product is selected with authenticity, fitment, and long-term reliability in mind."],
  ["03", "Customer Guidance", "Our support team helps drivers and workshops find the right part before ordering."],
];

const values = [
  ["Authenticity", "Products are sourced from trusted manufacturers and verified before reaching customers.", "shield"],
  ["Nationwide Reach", "Online ordering and support help customers source parts across Bangladesh.", "globe"],
  ["Expert Support", "Our team guides customers with part matching, fitment details, and practical advice.", "support"],
  ["Better Value", "We reduce sourcing friction while maintaining quality and service standards.", "star"],
];

const fallbackAbout = {
  seo: fallbackMetadata,
  hero: {
    eyebrow: "Authentic Automotive Since 2018",
    title: "Authentic Japanese Parts, Built for Confident Driving",
    highlightedText: "Japanese",
    description:
      "JPSPARE helps drivers, workshops, and auto enthusiasts source reliable Japanese automotive parts and accessories with clear guidance, fair value, and dependable support.",
    primaryCtaText: "Explore Parts",
    primaryCtaLink: "/car-parts",
    secondaryCtaText: "Contact Support",
    secondaryCtaLink: "/help",
    image: "/products-reference.png",
    imageAlt: "JPSPARE product catalogue",
    imageTitle: "JPSPARE Excellence",
    imageSubtitle: "Verified products, practical support, and fast sourcing.",
  },
  stats: heroStats.map(([value, label], index) => ({ value, label, enabled: true, sortOrder: (index + 1) * 10 })),
  story: {
    eyebrow: "Our Story",
    title: "Born from Passion for Japanese Engineering",
    highlightedText: "Japanese Engineering",
    paragraphs: [
      "JPSPARE operates under Authentic Automotive Ltd. with a simple mission: make genuine, high-quality Japanese automotive parts easier to find and easier to trust.",
      "From engine care and brake components to accessories, tyres, lighting, batteries, and car-care products, we focus on verified sourcing and practical support.",
      "Our team works with customers before and after purchase so every order feels clearer, faster, and more dependable.",
    ],
    milestones: storyMilestones.map(([number, title, body], index) => ({ number, title, body, enabled: true, sortOrder: (index + 1) * 10 })),
    missionTitle: "Our Mission",
    missionBody: "To make premium Japanese-brand spare parts accessible, fairly priced, and backed by support customers can rely on.",
  },
  imageBlocks: [
    {
      eyebrow: "JPSPARE In Action",
      title: "A Practical Parts Experience",
      description: "Our digital catalogue, product images, and support team work together so customers can compare, choose, and order with more confidence.",
      image: "/products-reference.png",
      imageAlt: "JPSPARE product selection",
      badges: ["Dhaka", "Genuine", "Fast"],
      enabled: true,
      sortOrder: 10,
    },
  ],
  values: values.map(([title, body, icon], index) => ({ title, body, icon, enabled: true, sortOrder: (index + 1) * 10 })),
  cta: {
    eyebrow: "Our Values",
    title: "Built on Strong Foundations",
    highlightedText: "Strong Foundations",
    description: "The JPSPARE experience is designed around trust, speed, clarity, and reliable automotive support.",
  },
};

async function getAboutCms() {
  try {
    const cms = await getHomepageCms();
    return cms?.sitePages?.about || fallbackAbout;
  } catch {
    return fallbackAbout;
  }
}

function enabledItems(items, fallback) {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source
    .filter((item) => item?.enabled !== false)
    .sort((a, b) => (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0));
}

function renderHighlightedText(text, highlightedText, className = "text-[#ef3338]") {
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
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    check: "M20 6 9 17l-5-5",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-8-9h16M12 3c2.2 2.4 3.2 5.4 3.2 9s-1 6.6-3.2 9c-2.2-2.4-3.2-5.4-3.2-9S9.8 5.4 12 3Z",
    support: "M3 18v-5a9 9 0 0 1 18 0v5M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z",
    star: "m12 3 2.6 5.5 6 .8-4.3 4.2 1.1 5.9-5.4-2.8-5.4 2.8 1.1-5.9L3.4 9.3l6-.8L12 3Z",
    target: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    box: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.5 8.5 12 13l8.5-4.5M12 22v-9",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function SectionBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#ffb7ba] bg-[#fff1f2] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ef3338]">
      <Icon name="shield" className="size-3.5" />
      {children}
    </span>
  );
}

export default async function AboutPage() {
  const about = await getAboutCms();
  const hero = about.hero || fallbackAbout.hero;
  const story = about.story || fallbackAbout.story;
  const imageBlock = enabledItems(about.imageBlocks, fallbackAbout.imageBlocks)[0] || fallbackAbout.imageBlocks[0];
  const statItems = enabledItems(about.stats, fallbackAbout.stats);
  const milestoneItems = enabledItems(story.milestones, fallbackAbout.story.milestones);
  const valueItems = enabledItems(about.values, fallbackAbout.values);
  const cta = about.cta || fallbackAbout.cta;

  return (
    <>
      <TopDealBar />
      <Header />
      <main className="bg-[#f4f6f8] text-[#111827]">
        <section className="px-4 pt-0 sm:px-6 lg:px-10">
          <div className="relative mx-auto grid min-h-[430px] w-full max-w-[1635px] overflow-hidden bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] px-6 py-14 text-white sm:px-9 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
            <div className="relative max-w-[780px]">
              <span className="inline-flex rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
                {hero.eyebrow || fallbackAbout.hero.eyebrow}
              </span>
              <h1 className="mt-7 text-[44px] font-black leading-[1.02] tracking-[-0.04em] sm:text-[58px]">
                {renderHighlightedText(hero.title || fallbackAbout.hero.title, hero.highlightedText || fallbackAbout.hero.highlightedText, "text-[#ff4a50]")}
              </h1>
              <p className="mt-5 max-w-[690px] text-[16px] font-medium leading-8 text-white/70">
                {hero.description || fallbackAbout.hero.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={hero.primaryCtaLink || fallbackAbout.hero.primaryCtaLink} className="inline-flex h-12 items-center gap-3 rounded-[8px] bg-[#ef3338] px-6 text-[14px] font-black text-white shadow-[0_14px_30px_rgba(239,51,56,0.24)] transition hover:-translate-y-0.5 hover:bg-[#d91f24]">
                  {hero.primaryCtaText || fallbackAbout.hero.primaryCtaText}
                  <Icon name="arrow" className="size-4" />
                </Link>
                <Link href={hero.secondaryCtaLink || fallbackAbout.hero.secondaryCtaLink} className="inline-flex h-12 items-center rounded-[8px] border border-white/25 px-6 text-[14px] font-black text-white transition hover:bg-white/10">
                  {hero.secondaryCtaText || fallbackAbout.hero.secondaryCtaText}
                </Link>
              </div>
            </div>

            <div className="relative mt-10 lg:mt-0">
              <div className="ml-auto max-w-[650px] rounded-[10px] border border-white/15 bg-white/8 p-3 backdrop-blur-sm">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-white">
                  <Image src={hero.image || fallbackAbout.hero.image} alt={hero.imageAlt || fallbackAbout.hero.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 650px" className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <p className="text-[22px] font-black">{hero.imageTitle || fallbackAbout.hero.imageTitle}</p>
                    <p className="mt-1 text-[13px] font-semibold text-white/70">{hero.imageSubtitle || fallbackAbout.hero.imageSubtitle}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-[8px] border border-white/15 bg-white/8 p-3 backdrop-blur-sm sm:grid-cols-4">
                {statItems.map(({ value, label }) => (
                  <div key={label} className="rounded-[6px] bg-black/15 px-3 py-3 text-center">
                    <p className="text-[19px] font-black text-[#ff5b61]">{value}</p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid w-full max-w-[1635px] gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="rounded-[8px] border border-[#e1e7ef] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <SectionBadge>{story.eyebrow || fallbackAbout.story.eyebrow}</SectionBadge>
              <h2 className="mt-6 text-[34px] font-black leading-tight tracking-[-0.04em]">
                {renderHighlightedText(story.title || fallbackAbout.story.title, story.highlightedText || fallbackAbout.story.highlightedText)}
              </h2>
              <div className="mt-6 space-y-5 text-[15px] font-medium leading-8 text-[#526071]">
                {(story.paragraphs || fallbackAbout.story.paragraphs).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              {milestoneItems.map(({ number, title, body }) => (
                <article key={title} className="flex gap-5 rounded-[8px] border border-[#e1e7ef] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#ef3338]/40">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#ef3338] text-[14px] font-black text-white">{number}</span>
                  <div>
                    <h3 className="text-[18px] font-black text-[#111827]">{title}</h3>
                    <p className="mt-2 text-[14px] font-medium leading-6 text-[#667085]">{body}</p>
                  </div>
                </article>
              ))}
              <div className="rounded-[8px] border border-[#ffd0d2] bg-[#fff1ee] p-7">
                <span className="grid size-14 place-items-center rounded-full bg-[#ef3338] text-white">
                  <Icon name="target" className="size-7" />
                </span>
                <h3 className="mt-5 text-[22px] font-black">{story.missionTitle || fallbackAbout.story.missionTitle}</h3>
                <p className="mt-3 max-w-[700px] text-[14px] font-medium leading-7 text-[#667085]">
                  {story.missionBody || fallbackAbout.story.missionBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-[1635px] rounded-[8px] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <SectionBadge>{imageBlock.eyebrow || fallbackAbout.imageBlocks[0].eyebrow}</SectionBadge>
                <h2 className="mt-6 text-[34px] font-black tracking-[-0.04em]">{imageBlock.title || fallbackAbout.imageBlocks[0].title}</h2>
                <p className="mt-4 text-[15px] font-medium leading-8 text-[#667085]">
                  {imageBlock.description || fallbackAbout.imageBlocks[0].description}
                </p>
                <div className="mt-7 grid grid-cols-3 gap-3">
                  {(imageBlock.badges || fallbackAbout.imageBlocks[0].badges).map((item) => (
                    <div key={item} className="rounded-[8px] border border-[#edf0f3] bg-[#f8fafc] p-4 text-center">
                      <p className="text-[17px] font-black text-[#ef3338]">{item}</p>
                      <p className="mt-1 text-[11px] font-bold text-[#98a2b3]">JPSPARE Parts</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[8px] border border-[#e1e7ef] bg-[#f8fafc] p-3">
                <div className="relative aspect-[16/8.2] overflow-hidden rounded-[6px] bg-white">
                  <Image src={imageBlock.image || fallbackAbout.imageBlocks[0].image} alt={imageBlock.imageAlt || fallbackAbout.imageBlocks[0].imageAlt} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#eef2f6] px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-[1635px] text-center">
            <SectionBadge>{cta.eyebrow || fallbackAbout.cta.eyebrow}</SectionBadge>
            <h2 className="mt-6 text-[34px] font-black tracking-[-0.04em]">{renderHighlightedText(cta.title || fallbackAbout.cta.title, cta.highlightedText || fallbackAbout.cta.highlightedText)}</h2>
            <p className="mx-auto mt-4 max-w-[720px] text-[15px] font-medium leading-7 text-[#667085]">
              {cta.description || fallbackAbout.cta.description}
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {valueItems.map(({ title, body, icon }) => (
                <article key={title} className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 text-left shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#ef3338]/40">
                  <span className="grid size-11 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338]">
                    <Icon name={icon} />
                  </span>
                  <h3 className="mt-6 text-[17px] font-black">{title}</h3>
                  <p className="mt-3 text-[14px] font-medium leading-7 text-[#667085]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
