import Link from "next/link";
import Image from "next/image";
import TopDealBar from "../TopDealBar";
import { Header } from "../page";

export const metadata = {
  title: "About JPSPARE | Authentic Japanese Excellence",
  description: "Learn about JPSPARE, our quality promise, values, and commitment to authentic Japanese automotive parts.",
};

const values = [
  ["Authenticity & Quality", "We only stock products that meet our strict criteria and originate from trusted Japanese manufacturers.", "blue"],
  ["Nation-wide Reach", "With our e-commerce platform and support services, we serve customers throughout Bangladesh with ease and speed.", "red"],
  ["Customer Support", "Our team is available daily to help you find the right component, understand compatibility, and handle any request.", "green"],
  ["Innovation & Convenience", "We introduce catalogues, search systems, and support tools so customers can source reliable parts faster.", "purple"],
];

const qualitySteps = [
  ["Testing", "Advanced reliability testing and inspection"],
  ["Authentication", "OEM codes and authenticity verification"],
  ["Inspection", "Premium quality inspection by expert technicians"],
  ["Certification", "Final quality seal with guarantee"],
];

const stories = [
  ["Authentic Japanese Quality", "Ordered genuine OEM brake pads and was amazed by the precision engineering. Perfect fitment and quality that matches original specifications.", "Mohammad Rahman", "Dhaka, Bangladesh", "Verified"],
  ["Exceptional Service & Support", "Their technical support team helped me identify the exact part I needed. The fitment quality and installation guidance were excellent.", "Fatima Khatun", "Chittagong, Bangladesh", "Verified"],
  ["Genuine OEM Parts, Great Value", "Delivered wanted parts for my engine mount. Got the authentic OEM part at a fair price with same warranty.", "Ahmed Hossain", "Sylhet, Bangladesh", "Verified"],
  ["Professional Reliability", "As a workshop mechanic, I need suppliers I can trust. JPSPARE consistently delivers OEM-grade components with proper documentation.", "Rashida Begum", "Khulna, Bangladesh", "Verified"],
  ["Superior Handling Performance", "Upgraded my suspension with their OEM struts. The difference in ride quality and handling is remarkable.", "Karim Uddin", "Kushtia, Bangladesh", "Verified"],
  ["Reliable Parts for Commercial Use", "Managing a fleet needs dependable parts. JPSPARE has become our trusted partner for maintenance.", "Nasir Ahmed", "Barisal, Bangladesh", "Verified"],
];

function Icon({ name, className = "size-5" }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    check: "M20 6 9 17l-5-5",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    target: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    star: "m12 3 2.6 5.5 6 .8-4.3 4.2 1.1 5.9-5.4-2.8-5.4 2.8 1.1-5.9L3.4 9.3l6-.8L12 3Z",
    globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-8-9h16M12 3c2.2 2.4 3.2 5.4 3.2 9s-1 6.6-3.2 9c-2.2-2.4-3.2-5.4-3.2-9S9.8 5.4 12 3Z",
    box: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.5 8.5 12 13l8.5-4.5M12 22v-9",
    support: "M3 18v-5a9 9 0 0 1 18 0v5M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#ffb6b6] bg-[#fff1f2] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#d3191d]">
      <Icon name="shield" className="size-3.5" />
      {children}
    </span>
  );
}

export default function AboutPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <main className="bg-white text-[#111827]">
        <section className="relative isolate overflow-hidden bg-[#111827] px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-20 bg-[url('/japanparts-reference.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/70 to-black/35" />
          <div className="mx-auto grid w-full max-w-[1180px] grid-cols-[0.95fr_1.05fr] items-center gap-12 max-lg:grid-cols-1">
            <div>
              <span className="inline-flex rounded-full bg-[#ef3338]/20 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#f7d95f]">Since 2018</span>
              <h1 className="mt-5 text-[54px] font-black leading-[1.03] tracking-[-0.05em] max-sm:text-[38px]">
                Authentic <span className="text-[#ef3338]">Japanese</span><br />Excellence
              </h1>
              <p className="mt-6 max-w-[560px] text-[16px] font-medium leading-8 text-white/75">
                Welcome to JPSPARE, your trusted destination for high-quality original Japanese automotive parts and accessories in Bangladesh.
              </p>
              <div className="mt-7 grid max-w-[430px] grid-cols-2 gap-3 text-[12px] font-bold text-white/82">
                {["Nation-wide Reach", "Authentic & Quality", "Dedicated Support", "Great Value"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-[7px] bg-white/8 px-3 py-2">
                    <Icon name="check" className="size-4 text-[#ef3338]" />
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/car-parts" className="inline-flex h-12 items-center gap-3 rounded-[7px] bg-[#ef3338] px-6 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d]">
                  Explore Our Parts <Icon name="arrow" className="size-4" />
                </Link>
                <Link href="/help" className="inline-flex h-12 items-center gap-3 rounded-[7px] border border-white/30 px-6 text-[13px] font-black text-white transition hover:bg-white/10">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="absolute -right-5 -top-5 rounded-full bg-emerald-500 px-4 py-2 text-[12px] font-black text-white shadow-lg">4.8/5 Rating</div>
              <div className="overflow-hidden rounded-[18px] border border-[#ef3338] bg-[#111827] p-3 shadow-[0_22px_48px_rgba(0,0,0,0.35)]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[12px]">
                  <Image src="/products-reference.png" alt="JPSPARE store excellence" fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-5 left-5 text-[18px] font-black">JPSPARE Excellence</p>
                  <span className="absolute bottom-5 right-5 rounded-full bg-blue-500 px-3 py-1 text-[11px] font-black">ISO Certified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[radial-gradient(circle_at_80%_20%,rgba(239,51,56,0.06),transparent_35%),#ffffff] px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            <Pill>Our Story</Pill>
            <h2 className="mt-6 text-[34px] font-black tracking-[-0.04em]">See JPSPARE in <span className="text-[#ef3338]">Action</span></h2>
            <p className="mx-auto mt-4 max-w-[660px] text-[15px] font-medium leading-7 text-[#6b7280]">
              A modern, well-stocked showroom and dispatch-ready warehouse serving customers across Bangladesh.
            </p>
            <div className="relative mx-auto mt-9 max-w-[720px]">
              <div className="relative overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white p-3 shadow-[0_22px_45px_rgba(15,23,42,0.14)]">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[12px]">
                  <Image src="/products-reference.png" alt="JPSPARE in action" fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
                </div>
              </div>
              <div className="mx-auto -mt-2 max-w-[520px] rounded-[8px] border border-[#edf0f3] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                <h3 className="text-[15px] font-black">JPSPARE in Action</h3>
                <p className="mt-3 text-[13px] font-medium leading-6 text-[#6b7280]">A dedicated customer service team guides you through the correct product or part number every time.</p>
                <div className="mt-5 grid grid-cols-3 gap-4 text-center">
                  {["Dhaka", "Genuine", "Fast"].map((item) => (
                    <div key={item}>
                      <p className="text-[16px] font-black text-[#ef3338]">{item}</p>
                      <p className="text-[11px] font-bold text-[#9ca3af]">JPSPARE Parts</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1180px] grid-cols-2 items-center gap-16 px-4 py-20 sm:px-6 lg:px-8 max-lg:grid-cols-1">
          <div>
            <Pill>Our Story</Pill>
            <h2 className="mt-6 text-[34px] font-black leading-tight tracking-[-0.04em]">Born from Passion for <span className="text-[#ef3338]">Japanese Engineering</span></h2>
            <div className="mt-6 space-y-5 text-[15px] font-medium leading-8 text-[#4b5563]">
              <p>Founded with a passion for performance, reliability and authenticity, JPSPARE operates under Authentic Automotive Ltd. to make premium Japanese-brand spare parts easily accessible.</p>
              <p>We specialize in sourcing and supplying genuine Japanese auto parts and accessories. Whether it is engine filters, brake components, tyres, lighting, batteries or car-care items, we bring verified solutions from top brands with clear provenance.</p>
              <p>At JPSPARE, your vehicle&apos;s performance and safety matter deeply to us. We support you with the right parts and expert guidance.</p>
            </div>
            <div className="mt-8 space-y-3">
              {[
                ["Founded", "Born from passion for Japanese engineering"],
                ["Quality", "Only products meeting strict criteria from trusted manufacturers"],
                ["Reach", "E-commerce platform serving customers throughout Bangladesh"],
                ["Value", "Cutting middle-man costs while upholding quality standards"],
              ].map(([title, body], index) => (
                <div key={title} className="flex gap-4 rounded-[8px] border-l-4 border-[#ef3338] bg-[#f8fafc] p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[7px] bg-[#ef3338] text-[12px] font-black text-white">{index + 1}</span>
                  <div>
                    <h3 className="text-[14px] font-black">{title}</h3>
                    <p className="mt-1 text-[12px] font-medium text-[#6b7280]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[16px] bg-[#fff1ee] p-14 text-center max-sm:p-8">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#ef3338] text-white shadow-[0_14px_28px_rgba(239,51,56,0.2)]">
              <Icon name="target" className="size-9" />
            </span>
            <h3 className="mt-7 text-[22px] font-black">Our Mission</h3>
            <p className="mx-auto mt-4 max-w-[360px] text-[14px] font-medium leading-7 text-[#6b7280]">To make premium Japanese-brand spare parts easily accessible, affordably priced and backed by service you can rely on.</p>
          </div>
        </section>

        <section className="bg-[#f8fafc] px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1180px]">
            <Pill>Our Values</Pill>
            <h2 className="mt-6 text-[34px] font-black tracking-[-0.04em]">Built on <span className="text-[#ef3338]">Strong Foundations</span></h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[15px] font-medium leading-7 text-[#6b7280]">By cutting unnecessary middle-man costs, we pass savings to you while upholding our quality and service standards.</p>
            <div className="mt-12 grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {values.map(([title, body, tone]) => (
                <article key={title} className="rounded-[10px] border border-[#edf0f3] bg-white p-8 text-left shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#f7d95f]">
                  <span className={`grid size-11 place-items-center rounded-[8px] ${tone === "blue" ? "bg-blue-50 text-blue-600" : tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "purple" ? "bg-fuchsia-50 text-fuchsia-600" : "bg-red-50 text-[#ef3338]"}`}>
                    <Icon name={tone === "green" ? "support" : tone === "purple" ? "star" : tone === "blue" ? "shield" : "globe"} />
                  </span>
                  <h3 className="mt-6 text-[16px] font-black">{title}</h3>
                  <p className="mt-4 text-[13px] font-medium leading-6 text-[#6b7280]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1180px]">
            <Pill>Quality Process</Pill>
            <h2 className="mt-6 text-[34px] font-black tracking-[-0.04em]">Our Quality Promise</h2>
            <p className="mx-auto mt-4 max-w-[660px] text-[15px] font-medium leading-7 text-[#6b7280]">Every part undergoes rigorous testing and verification to ensure you receive only authentic, high-quality Japanese automotive components.</p>
            <div className="mt-12 grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {qualitySteps.map(([title, body], index) => (
                <article key={title} className="relative rounded-[8px] border border-[#edf0f3] bg-white p-7 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <span className="absolute -top-3 left-5 grid size-6 place-items-center rounded-full bg-[#ef3338] text-[11px] font-black text-white">{index + 1}</span>
                  <Icon name={index === 0 ? "target" : index === 1 ? "shield" : index === 2 ? "check" : "star"} className="mx-auto size-8 text-[#2f74f3]" />
                  <h3 className="mt-4 text-[15px] font-black">{title}</h3>
                  <p className="mt-2 text-[12px] font-medium leading-5 text-[#6b7280]">{body}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-5 text-[12px] font-bold text-[#6b7280]">
              <span className="text-emerald-600">ISO 9001 Certified</span>
              <span>25+ Standards</span>
              <Link href="/help" className="rounded-[6px] bg-[#ef3338] px-5 py-2 text-white">Learn More</Link>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 pb-24 pt-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1180px]">
            <Pill>Customer Reviews</Pill>
            <h2 className="mt-6 text-[34px] font-black tracking-[-0.04em]">Customer Stories</h2>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-[#ef3338]" />
            <p className="mx-auto mt-5 max-w-[620px] text-[15px] font-medium leading-7 text-[#6b7280]">Hear from the automotive enthusiasts and professionals who trust JPSPARE for their projects.</p>
            <div className="mt-12 grid grid-cols-3 gap-7 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {stories.map(([title, body, name, place, badge]) => (
                <article key={`${title}-${name}`} className="rounded-[10px] border border-[#edf0f3] bg-white p-7 text-left shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#f7d95f]">
                  <p className="text-[26px] font-black text-[#ef3338]">”</p>
                  <p className="mt-2 text-[#ef3338]">★★★★★ <span className="text-[12px] font-black text-[#111827]">5.0</span></p>
                  <h3 className="mt-4 text-[17px] font-black">{title}</h3>
                  <p className="mt-3 text-[13px] font-medium leading-6 text-[#6b7280]">{body}</p>
                  <div className="mt-6 border-t border-[#edf0f3] pt-5">
                    <p className="font-black">{name}</p>
                    <p className="mt-1 text-[12px] font-medium text-[#6b7280]">{place}</p>
                    <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-600">{badge}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
