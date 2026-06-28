import Link from "next/link";

export const metadata = {
  title: "Exclusive Deals & Offers | JPSPARE",
  description: "Limited-time JPSPARE offers on premium Japanese automotive parts and accessories.",
};

function Icon({ name, className = "size-5" }) {
  const paths = {
    percent: "M19 5 5 19M7.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
    gift: "M20 12v8H4v-8M2 8h20v4H2V8Zm10 0v12M12 8H7.5a2.5 2.5 0 1 1 2-4L12 8Zm0 0h4.5a2.5 2.5 0 1 0-2-4L12 8Z",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    star: "m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.9-6.2-3.3L5.8 21 7 14.1l-5-4.8 6.9-1L12 2Z",
    clock: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

const benefits = [
  {
    title: "Best Prices",
    description: "Competitive pricing on premium Japanese automotive parts.",
    icon: "percent",
    tone: "bg-[#dcfce7] text-[#16a34a]",
  },
  {
    title: "Quality Guarantee",
    description: "Only authentic, high-quality parts from trusted Japanese manufacturers.",
    icon: "star",
    tone: "bg-[#dbeafe] text-[#2563eb]",
  },
  {
    title: "Fast Delivery",
    description: "Quick and reliable shipping to get your parts when you need them.",
    icon: "clock",
    tone: "bg-[#f3e8ff] text-[#9333ea]",
  },
];

export default function OffersPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto w-full max-w-[1635px] px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ffb4b6] bg-[#fff1f1] px-5 py-2.5 text-[14px] font-black uppercase tracking-[0.06em] text-[#c81e25]">
            <Icon name="percent" className="size-4" />
            Special Offers
          </div>
          <h1 className="mt-7 text-[48px] font-black leading-tight tracking-[-0.03em] text-[#111827] max-sm:text-[34px]">
            Exclusive Deals & Offers
          </h1>
          <p className="mx-auto mt-5 max-w-[760px] text-[21px] leading-8 text-[#4b5563] max-sm:text-[16px] max-sm:leading-7">
            Save big on premium Japanese automotive parts. Limited time offers on top brands and essential components.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-[1216px] rounded-[14px] bg-[#fff3ee] px-6 py-16 text-center shadow-[0_22px_55px_rgba(15,23,42,0.04)] sm:px-10 lg:py-20">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#ffe0e2] text-[#e51f28]">
            <Icon name="gift" className="size-10" />
          </div>
          <h2 className="mt-7 text-[24px] font-black text-[#111827]">Amazing Deals Coming Soon!</h2>
          <p className="mx-auto mt-5 max-w-[720px] text-[17px] leading-7 text-[#4b5563]">
            We're preparing exclusive discounts and special offers on our premium Japanese automotive parts. Check back soon for incredible savings on top-quality components.
          </p>
          <div className="mt-8 flex justify-center gap-4 max-sm:flex-col">
            <Link href="/products" className="inline-flex h-[54px] items-center justify-center gap-3 rounded-[8px] bg-[#ef3338] px-8 text-[16px] font-bold text-white shadow-[0_16px_30px_rgba(239,51,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d91f25]">
              Browse All Products
              <Icon name="arrow" className="size-5" />
            </Link>
            <Link href="/collection" className="inline-flex h-[54px] items-center justify-center gap-3 rounded-[8px] border border-[#ef3338] bg-white px-8 text-[16px] font-bold text-[#ef3338] transition hover:-translate-y-0.5 hover:bg-[#fff1f1]">
              Shop by Category
              <Icon name="star" className="size-5" />
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-[1216px] gap-10 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="text-center">
              <div className={`mx-auto grid size-16 place-items-center rounded-full ${benefit.tone}`}>
                <Icon name={benefit.icon} className="size-8" />
              </div>
              <h3 className="mt-5 text-[20px] font-black text-[#111827]">{benefit.title}</h3>
              <p className="mx-auto mt-3 max-w-[360px] text-[16px] leading-7 text-[#4b5563]">{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
