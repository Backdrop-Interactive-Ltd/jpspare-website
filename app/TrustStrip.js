"use client";

const trustItems = [
  {
    title: "Authentic Guarantee",
    text: "100% genuine OEM parts with authenticity certificates",
    points: ["Verified", "coverage", "Quality inspection certified"],
    icon: "shield",
    popular: true,
  },
  {
    title: "Fast Shipping",
    text: "Express nationwide delivery with real-time tracking",
    points: ["Free shipping on ৳4000+", "Express delivery available", "150+ countries served"],
    icon: "truck",
  },
  {
    title: "Expert Support",
    text: "24/7 technical assistance from automotive specialists",
    points: ["Round-the-clock support", "Certified technicians", "Installation guidance"],
    icon: "headphones",
  },
  {
    title: "Easy Returns",
    text: "30-day hassle-free returns with free return shipping",
    points: ["30-day return policy", "Free return labels", "Quick refund processing"],
    icon: "rotate",
  },
  {
    title: "Same-Day Processing",
    text: "Orders processed within hours for faster delivery",
    points: ["Same-day processing", "Real-time inventory", "Priority handling"],
    icon: "clock",
  },
  {
    title: "Best Price Promise",
    text: "Competitive pricing with price matching guarantee",
    points: ["Price match guarantee", "Member discounts", "Volume pricing available"],
    icon: "award",
    popular: true,
  },
];

function TrustIcon({ name, className = "size-4.5" }) {
  const icons = {
    award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3 0-1 6 4-2 4 2-1-6",
    check: "M20 6 9 17l-5-5",
    clock: "M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    headphones: "M3 14v-3a9 9 0 0 1 18 0v3M5 14h3v7H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm14 0h-3v7h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z",
    rotate: "M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16m0 5v-5h5",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default function TrustStrip() {
  return (
    <section className="border-y border-[#e5e7eb] bg-[#f7f8fa] py-6">
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-6 gap-8 px-4 text-[#111827] sm:px-6 lg:px-8 xl:px-10 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
        {trustItems.map((item) => (
          <article
            key={item.title}
            tabIndex={0}
            className={`group/trust relative min-h-[190px] rounded-[10px] border bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#5d1f1f] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)] focus:-translate-y-1 focus:border-[#5d1f1f] focus:shadow-[0_16px_34px_rgba(220,38,38,0.12)] focus:outline-none ${
              item.popular ? "border-[#5d1f1f]" : "border-[#dfe5ec]"
            }`}
          >
            {item.popular ? (
              <span className="absolute -right-2 -top-2 rounded-full bg-[#ef3338] px-2.5 py-1 text-[11px] font-black leading-none text-white shadow-[0_8px_18px_rgba(239,51,56,0.24)]">
                Popular
              </span>
            ) : null}
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-[10px] transition duration-200 ${
                item.popular
                  ? "bg-[#ffe1e1] text-[#ef3338]"
                  : "bg-[#f3f4f7] text-[#334155] group-hover/trust:bg-[#ffe8e8] group-hover/trust:text-[#ef3338] group-focus/trust:bg-[#ffe8e8] group-focus/trust:text-[#ef3338]"
              }`}
            >
              <TrustIcon name={item.icon} />
            </span>
            <h2 className="mt-3 text-[15px] font-black leading-[1.2] text-[#111827]">{item.title}</h2>
            <p className="mt-2 text-[12.5px] leading-[1.5] text-[#4b5563]">{item.text}</p>
            <ul className="mt-3 space-y-1.5">
              {item.points.map((point) => (
                <li key={point} className="flex items-center gap-1.5 text-[11px] font-medium leading-snug text-[#6b7280]">
                  <TrustIcon name="check" className="size-3 shrink-0 text-[#10b981]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
