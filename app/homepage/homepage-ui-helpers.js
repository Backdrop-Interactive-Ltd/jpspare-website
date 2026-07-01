export function Icon({ name, className = "size-5" }) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    cart: (
      <>
        <path d="M6 6h15l-2 8H8L6 3H3" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    car: (
      <>
        <path d="M5 13h14l-1.5-4.5A2 2 0 0 0 15.6 7H8.4a2 2 0 0 0-1.9 1.5L5 13Z" />
        <path d="M4 13v4h2" />
        <path d="M20 13v4h-2" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </>
    ),
    heart: <path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.7l8.8-8.8a5 5 0 0 0 0-7.1Z" />,
    trend: <path d="m4 17 6-6 4 4 6-8M15 7h5v5" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    userMinimal: (
      <>
        <circle cx="12" cy="6" r="3.2" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />,
    package: (
      <>
        <path d="M21 8.5 12 3 3 8.5l9 5.5 9-5.5Z" />
        <path d="M3 8.5V16l9 5 9-5V8.5" />
        <path d="M12 14v7" />
      </>
    ),
    gift: (
      <>
        <path d="M20 12v9H4v-9" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 7v14" />
        <path d="M12 7H8.5a2.5 2.5 0 1 1 2.5-2.5V7Z" />
        <path d="M12 7h3.5A2.5 2.5 0 1 0 13 4.5V7Z" />
      </>
    ),
    calendar: (
      <>
        <path d="M8 2v4M16 2v4" />
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M4 10h16" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
    star: <path d="m12 3 2.6 5.5 6 .9-4.3 4.2 1 6-5.3-2.9-5.3 2.9 1-6-4.3-4.2 6-.9L12 3Z" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    award: (
      <>
        <circle cx="12" cy="8" r="5" />
        <path d="M8.5 12.2 7 22l5-3 5 3-1.5-9.8" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    tag: <path d="M20 10 14 4H5v9l6 6 9-9ZM8 8h.01" />,
    check: <path d="M20 6 9 17l-5-5" />,
    rotate: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v6h6" />,
    headphones: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 14h3v5H4z" />
        <path d="M17 14h3v5h-3z" />
      </>
    ),
    smartphone: (
      <>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
    disc: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8 10a4 4 0 1 1 8 0c0 2-1.2 3.1-2 4.2V16h-4v-1.8C9.2 13.1 8 12 8 10Z" />
      </>
    ),
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z" />,
    flashSolid: <path d="M13 2H6l3 8H5l7 12v-9h5L13 2Z" />,
    filter: <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" />,
    drop: <path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z" />,
    wave: <path d="M3 12h4l2-6 4 12 2-6h6" />,
    horn: <path d="M5 14h3l8 4V6l-8 4H5v4Z" />,
    battery: (
      <>
        <path d="M5 8h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5V8Z" />
        <path d="M20 11h2v2h-2" />
      </>
    ),
    pulse: <path d="M4 13h4l2-7 4 12 2-5h4" />,
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
      </>
    ),
    fuel: (
      <>
        <path d="M4 3h9v18H4z" />
        <path d="M8 7h2" />
        <path d="M13 8h3l3 3v8a2 2 0 0 1-4 0v-4a2 2 0 0 0-2-2" />
        <path d="m16 8 2-2" />
      </>
    ),
    body: (
      <>
        <path d="M4 14h16" />
        <path d="M6 14l1.6-4.7A2 2 0 0 1 9.5 8h5a2 2 0 0 1 1.9 1.3L18 14" />
        <path d="M6 14v3h2" />
        <path d="M18 14v3h-2" />
        <path d="M8 11h8" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function ChevronDown({ className = "size-3" }) {
  return (
    <svg className={className} viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m1 1.5 5 5 5-5" />
    </svg>
  );
}

export function categoryTone(tone) {
  const tones = {
    red: "text-[#f7373b] hover:border-[#f8d563] hover:shadow-[0_10px_24px_rgba(247,55,59,0.14)]",
    orange: "text-[#ff7d34] hover:border-[#ffb26f] hover:shadow-[0_10px_24px_rgba(255,125,52,0.14)]",
    blue: "text-[#2563ff] hover:border-[#8bb0ff] hover:shadow-[0_10px_24px_rgba(37,99,255,0.14)]",
    green: "text-[#10b981] hover:border-[#69ddb2] hover:shadow-[0_10px_24px_rgba(16,185,129,0.14)]",
    teal: "text-[#08b9ae] hover:border-[#6fe1d9] hover:shadow-[0_10px_24px_rgba(8,185,174,0.14)]",
    purple: "text-[#9b35ff] hover:border-[#c58cff] hover:shadow-[0_10px_24px_rgba(155,53,255,0.14)]",
    amber: "text-[#f59e0b] hover:border-[#ffd56d] hover:shadow-[0_10px_24px_rgba(245,158,11,0.14)]",
    cyan: "text-[#08aeda] hover:border-[#72dcf5] hover:shadow-[0_10px_24px_rgba(8,174,218,0.14)]",
    indigo: "text-[#5948ff] hover:border-[#a197ff] hover:shadow-[0_10px_24px_rgba(89,72,255,0.14)]",
  };

  return tones[tone] || tones.red;
}

export function iconTone(tone) {
  const tones = {
    red: "bg-[#fff0f0]",
    orange: "bg-[#fff5e9]",
    blue: "bg-[#eef5ff]",
    green: "bg-[#eafff3]",
    teal: "bg-[#eafffb]",
    purple: "bg-[#f8efff]",
    amber: "bg-[#fff8df]",
    cyan: "bg-[#eafcff]",
    indigo: "bg-[#eef0ff]",
  };

  return tones[tone] || tones.red;
}

export function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
