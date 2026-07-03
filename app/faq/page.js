import Link from "next/link";
import TopDealBar from "../TopDealBar";
import { Header } from "../page";
import { defaultHomepageCms, getHomepageCms } from "@/lib/homepage/cms";

const fallbackFaq = defaultHomepageCms.sitePages.faq;
const fallbackMetadata = fallbackFaq.seo;

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const faq = await getFaqCms();

  return {
    title: faq.seo?.metaTitle || faq.seo?.title || fallbackMetadata.metaTitle || fallbackMetadata.title,
    description: faq.seo?.metaDescription || faq.seo?.description || fallbackMetadata.metaDescription || fallbackMetadata.description,
  };
}

async function getFaqCms() {
  try {
    const cms = await getHomepageCms();
    return cms?.sitePages?.faq || fallbackFaq;
  } catch {
    return fallbackFaq;
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
    help: "M9.1 9a3 3 0 1 1 5.8 1c-.5 1.5-2 2-2.8 3-.5.6-.6 1.1-.6 2M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    check: "M20 6 9 17l-5-5",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default async function FaqPage() {
  const faq = await getFaqCms();
  const hero = faq.hero || fallbackFaq.hero;
  const categories = enabledItems(faq.categories, fallbackFaq.categories);
  const cta = faq.cta || fallbackFaq.cta;

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
                {hero.eyebrow || hero.subtitle || fallbackFaq.hero.eyebrow}
              </span>
              <h1 className="mt-6 text-[42px] font-black leading-tight tracking-[-0.04em] sm:text-[56px]">{hero.title || fallbackFaq.hero.title}</h1>
              <p className="mt-4 max-w-[760px] text-[16px] font-medium leading-7 text-white/68">{hero.description || fallbackFaq.hero.description}</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto grid w-full max-w-[1635px] gap-6 lg:grid-cols-[0.32fr_0.68fr]">
            <aside className="space-y-5">
              <div className="rounded-[8px] border border-[#ffd0d2] bg-[#fff1ee] p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#ef3338] text-white">
                    <Icon name="help" />
                  </span>
                  <div>
                    <h2 className="text-[20px] font-black text-[#7c2d12]">FAQ Topics</h2>
                    <p className="mt-3 text-[14px] font-semibold leading-7 text-[#9f1d20]">
                      Browse questions by category and contact support if you need more help.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <h2 className="text-[20px] font-black">Categories</h2>
                <div className="mt-5 space-y-3">
                  {categories.map((category) => {
                    const questions = enabledItems(category.items, []);
                    return (
                      <div key={category.title} className="flex items-center justify-between gap-3 rounded-[8px] bg-[#f8fafc] px-4 py-3 text-[13px] font-bold text-[#344054]">
                        <span>{category.title}</span>
                        <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 text-[11px] font-black text-[#ef3338]">{questions.length}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              {categories.map((category) => {
                const questions = enabledItems(category.items, []);
                return (
                  <section key={category.title} className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338]">
                        <Icon name="help" className="size-5" />
                      </span>
                      <div>
                        <h2 className="text-[22px] font-black tracking-[-0.02em] text-[#111827]">{category.title}</h2>
                        <p className="mt-2 text-[14px] font-medium leading-7 text-[#526071]">{category.description || category.body}</p>
                      </div>
                    </div>
                    <div className="mt-6 divide-y divide-[#edf0f3] border-t border-[#edf0f3]">
                      {questions.map((item) => (
                        <article key={item.question || item.title} className="py-5">
                          <h3 className="flex items-start gap-3 text-[17px] font-black text-[#111827]">
                            <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-[#ef3338] text-white">
                              <Icon name="check" className="size-3.5" />
                            </span>
                            {item.question || item.title}
                          </h3>
                          <p className="mt-3 pl-9 text-[14px] font-medium leading-7 text-[#667085]">{item.answer || item.description || item.body}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}

              <article className="rounded-[8px] border border-[#ffd0d2] bg-[#fff1ee] p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ef3338]">Support</p>
                    <h2 className="mt-2 text-[24px] font-black">{cta.heading || cta.title || fallbackFaq.cta.heading}</h2>
                    <p className="mt-2 text-[14px] font-medium text-[#667085]">{cta.description || fallbackFaq.cta.description}</p>
                  </div>
                  <Link href={cta.buttonLink || fallbackFaq.cta.buttonLink} className="inline-flex h-12 shrink-0 items-center justify-center rounded-[8px] bg-[#ef3338] px-7 text-[14px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f24]">
                    {cta.buttonText || fallbackFaq.cta.buttonText}
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
