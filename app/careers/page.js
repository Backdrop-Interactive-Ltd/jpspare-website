import Link from "next/link";
import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import { defaultHomepageCms, getHomepageCms } from "@/lib/homepage/cms";

const fallbackCareers = defaultHomepageCms.sitePages.careers;
const fallbackMetadata = fallbackCareers.seo;

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const careers = await getCareersCms();

  return {
    title: careers.seo?.metaTitle || careers.seo?.title || fallbackMetadata.metaTitle || fallbackMetadata.title,
    description: careers.seo?.metaDescription || careers.seo?.description || fallbackMetadata.metaDescription || fallbackMetadata.description,
  };
}

async function getCareersCms() {
  try {
    const cms = await getHomepageCms();
    return cms?.sitePages?.careers || fallbackCareers;
  } catch {
    return fallbackCareers;
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
    arrow: "M5 12h14m-6-6 6 6-6 6",
    check: "M20 6 9 17l-5-5",
    briefcase: "M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14v13H5V6Zm0 5h14",
    clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    growth: "M4 19V5m0 14h16M7 15l4-4 3 3 5-7",
    learning: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5v-13Z",
    money: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6",
  };
  const path = icons[name] || icons.check;

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function benefitIcon(name) {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("trend") || normalized.includes("growth")) return "growth";
  if (normalized.includes("clock") || normalized.includes("flex")) return "clock";
  if (normalized.includes("book") || normalized.includes("learn")) return "learning";
  if (normalized.includes("dollar") || normalized.includes("compensation")) return "money";
  return "check";
}

export default async function CareersPage() {
  const careers = await getCareersCms();
  const hero = careers.hero || fallbackCareers.hero;
  const benefits = enabledItems(careers.benefits, fallbackCareers.benefits);
  const hiringProcess = enabledItems(careers.hiringProcess, fallbackCareers.hiringProcess);
  const openings = enabledItems(careers.openings, fallbackCareers.openings);
  const cta = careers.cta || fallbackCareers.cta;

  return (
    <>
      <TopDealBar />
      <Header />
      <main className="min-h-screen bg-[#f4f6f8] text-[#111827]">
        <section className="px-4 pt-0 sm:px-6 lg:px-10">
          <div className="relative mx-auto flex min-h-[340px] w-full max-w-[1635px] items-center overflow-hidden border border-white/10 bg-[linear-gradient(112deg,#111827_0%,#111827_62%,#4b1d2b_100%)] px-6 py-12 text-white sm:px-9 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,51,56,0.14),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
            <div className="relative flex w-full flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[860px]">
                <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.12em] text-[#ffb5b8] transition hover:text-white">
                  <Icon name="arrowLeft" className="size-4" />
                  Back to Home
                </Link>
                <span className="mt-8 inline-flex items-center rounded-full border border-[#ff8c91]/30 bg-[#ef3338]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffb5b8]">
                  {hero.eyebrow || hero.subtitle || fallbackCareers.hero.eyebrow}
                </span>
                <h1 className="mt-6 text-[42px] font-black leading-tight tracking-[-0.04em] sm:text-[56px]">{hero.title || fallbackCareers.hero.title}</h1>
                <p className="mt-4 max-w-[760px] text-[16px] font-medium leading-7 text-white/68">{hero.description || fallbackCareers.hero.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-[8px] border border-white/15 bg-white/8 p-3 backdrop-blur-sm lg:min-w-[430px]">
                <div className="rounded-[6px] bg-black/15 px-3 py-3 text-center">
                  <p className="text-[19px] font-black text-[#ff5b61]">{openings.length}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55">Open Roles</p>
                </div>
                <div className="rounded-[6px] bg-black/15 px-3 py-3 text-center">
                  <p className="text-[19px] font-black text-[#ff5b61]">{benefits.length}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55">Benefits</p>
                </div>
                <div className="rounded-[6px] bg-black/15 px-3 py-3 text-center">
                  <p className="text-[19px] font-black text-[#ff5b61]">{hiringProcess.length}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/55">Steps</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-[1635px] space-y-10">
            <section>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ef3338]">Why Join Us</p>
                  <h2 className="mt-2 text-[30px] font-black tracking-[-0.03em] text-[#111827]">Benefits at JPSPARE</h2>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {benefits.map((item) => (
                  <article key={item.title} className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#ef3338]/40">
                    <span className="grid size-11 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338]">
                      <Icon name={benefitIcon(item.icon)} />
                    </span>
                    <h3 className="mt-5 text-[19px] font-black tracking-[-0.02em] text-[#111827]">{item.title}</h3>
                    <p className="mt-3 text-[14px] font-medium leading-7 text-[#526071]">{item.description || item.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.36fr_0.64fr]">
              <aside className="rounded-[8px] border border-[#ffd0d2] bg-[#fff1ee] p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#ef3338] text-white">
                    <Icon name="briefcase" />
                  </span>
                  <div>
                    <h2 className="text-[22px] font-black text-[#7c2d12]">Hiring Process</h2>
                    <p className="mt-3 text-[14px] font-semibold leading-7 text-[#9f1d20]">
                      Our process is designed to keep expectations clear from application to onboarding.
                    </p>
                  </div>
                </div>
              </aside>

              <div className="grid gap-4 md:grid-cols-2">
                {hiringProcess.map((step, index) => (
                  <article key={step.title} className="rounded-[8px] border border-[#e1e7ef] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[14px] font-black text-[#ef3338]">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-[18px] font-black text-[#111827]">{step.title}</h3>
                        <p className="mt-2 text-[14px] font-medium leading-7 text-[#667085]">{step.description || step.body}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5">
                <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ef3338]">Open Roles</p>
                <h2 className="mt-2 text-[30px] font-black tracking-[-0.03em] text-[#111827]">Current Job Openings</h2>
              </div>
              <div className="grid gap-5">
                {openings.map((job) => (
                  <article key={job.title} className="rounded-[8px] border border-[#e1e7ef] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#ef3338]/40">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#fff1f2] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#ef3338]">{job.department}</span>
                          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#64748b]">{job.type}</span>
                          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#64748b]">{job.location}</span>
                        </div>
                        <h3 className="mt-4 text-[24px] font-black tracking-[-0.03em] text-[#111827]">{job.title}</h3>
                        <p className="mt-3 max-w-[860px] text-[14px] font-medium leading-7 text-[#526071]">{job.description || job.body}</p>
                      </div>
                      <Link href={job.applyLink || job.href || cta.buttonLink || fallbackCareers.cta.buttonLink} className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-[8px] bg-[#ef3338] px-7 text-[14px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f24]">
                        Apply
                        <Icon name="arrow" className="size-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <article className="rounded-[8px] border border-[#ffd0d2] bg-[#fff1ee] p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ef3338]">Careers</p>
                  <h2 className="mt-2 text-[24px] font-black">{cta.heading || cta.title || fallbackCareers.cta.heading}</h2>
                  <p className="mt-2 text-[14px] font-medium text-[#667085]">{cta.description || fallbackCareers.cta.description}</p>
                </div>
                <Link href={cta.buttonLink || fallbackCareers.cta.buttonLink} className="inline-flex h-12 shrink-0 items-center justify-center rounded-[8px] bg-[#ef3338] px-7 text-[14px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f24]">
                  {cta.buttonText || fallbackCareers.cta.buttonText}
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
