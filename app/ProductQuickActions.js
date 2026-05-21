"use client";

function Icon({ name }) {
  const icons = {
    eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
    compare: "m4 17 6-6 4 4 6-8M15 7h5v5",
  };

  return (
    <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default function ProductQuickActions({ productUrl = "#", productName = "product" }) {
  const actions = [
    { icon: "eye", label: `Quick view ${productName}`, href: productUrl },
    { icon: "heart", label: `Add ${productName} to wishlist`, href: "/wishlisht" },
    { icon: "compare", label: `Compare ${productName}`, href: "/compare" },
  ];

  return (
    <div className="absolute bottom-3 left-3 z-10 flex overflow-hidden rounded-[6px] border border-[#e5e7eb] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.12)] opacity-0 translate-y-2 transition duration-200 group-hover/product:translate-y-0 group-hover/product:opacity-100 group-focus-within/product:translate-y-0 group-focus-within/product:opacity-100">
      {actions.map((action, index) => {
        const className = `grid size-10 place-items-center text-[#475467] transition hover:bg-[#fff5f5] hover:text-[#ef3338] ${
          index > 0 ? "border-l border-[#edf0f3]" : ""
        }`;

        if (action.href) {
          return (
            <a key={action.icon} href={action.href} className={className} aria-label={action.label}>
              <Icon name={action.icon} />
            </a>
          );
        }

        return (
          <button key={action.icon} type="button" className={className} aria-label={action.label}>
            <Icon name={action.icon} />
          </button>
        );
      })}
    </div>
  );
}
