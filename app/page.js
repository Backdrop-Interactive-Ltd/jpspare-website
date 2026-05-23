import Link from "next/link";
import TopDealBar from "./TopDealBar";
import ProductTabs, { BestSellingAutoParts, LatestJapaneseAutoParts } from "./ProductTabs";
import VideoGallery from "./VideoGallery";
import CustomerReviews from "./CustomerReviews";
import PartsInquirySection from "./PartsInquirySection";
import HeaderSearch from "./HeaderSearch";
import CompareHashRedirect from "./CompareHashRedirect";
import HeaderCartButton from "./HeaderCartButton";
import HeaderAccountButton from "./HeaderAccountButton";
import HeroBannerSlider from "./HeroBannerSlider";
import DynamicLogoMark from "./DynamicLogoMark";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "CAR ACCESSORIES", href: "/car-accessories", hasMenu: true },
  { label: "CAR PARTS", href: "/car-parts", hasMenu: true },
  { label: "TYRES", href: "/tyres", hasMenu: true },
  { label: "LUBRICANT", href: "/lubricant", hasMenu: true },
  { label: "BRANDS", href: "/brands" },
  { label: "MODIFICATION", href: "/modification" },
  { label: "COMBO PACKAGE", href: "/combo-package" },
];

const carAccessorySubcategories = [
  { title: "Interior", icon: "car", tone: "red", links: ["Air Freshener", "Seat Covers", "Floor Mats"] },
  { title: "Exterior", icon: "body", tone: "blue", links: ["Car Cover", "Mud Guard", "Chrome Trim"] },
  { title: "Electronics", icon: "bolt", tone: "indigo", links: ["Phone Holder", "Dash Camera", "Chargers"] },
  { title: "Car Care", icon: "drop", tone: "teal", links: ["Wax", "Shampoo", "Washer Fluid"] },
  { title: "Utility", icon: "package", tone: "amber", links: ["Organizer", "Tool Kit", "Storage"] },
  { title: "Safety", icon: "check", tone: "green", links: ["Emergency Kit", "Reflector", "First Aid"] },
  { title: "Performance", icon: "trend", tone: "orange", links: ["Cleaner", "Additive", "Filter Care"] },
  { title: "Lifestyle", icon: "star", tone: "purple", links: ["Perfume", "Decor", "Travel"] },
];

const vehicleBrands = ["Toyota", "Honda", "Nissan", "Mitsubishi", "Suzuki"];

const heroSlides = [
  { src: "/jpspare-hero-slide-1.gif", alt: "Pirelli podium cap special edition banner" },
  { src: "/jpspare-hero-slide-2.png", alt: "Mobil online shopping delivery banner" },
  { src: "/jpspare-hero-slide-3.jpg", alt: "Mobil 1 synthetic motor oil brand banner" },
];

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
    icon: "car",
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

const carPartCategories = [
  {
    title: "BRAKES",
    icon: "disc",
    tone: "red",
    links: ["BRAKE PAD", "BRAKE SHOE", "BRAKE FLUID"],
  },
  {
    title: "BULB",
    icon: "bulb",
    tone: "orange",
    links: ["HID", "LED", "HALOGEN"],
  },
  {
    title: "TYRE",
    icon: "car",
    tone: "blue",
    links: ["CAR TYRE", "SUV TYRE"],
  },
  {
    title: "ELECTRICAL PARTS",
    icon: "bolt",
    tone: "blue",
    links: ["IGNITION COIL", "AC FUEL PUMP", "HEAD LIGHT SET"],
  },
  {
    title: "FILTER",
    icon: "filter",
    tone: "green",
    links: ["AIR FILTER", "OIL FILTER", "A/C FILTER"],
  },
  {
    title: "CAR CARE ITEM",
    icon: "drop",
    tone: "teal",
    links: ["CAR WASH", "CAR POLISH", "CAR CLEANER", "AIR FRESHNER"],
  },
  {
    title: "BODY PARTS",
    icon: "car",
    tone: "purple",
    links: ["WINDSHIELD", "Modellista Body Kits", "WALD Body Kits", "Other Body Kits"],
  },
  {
    title: "LUBRICANT",
    icon: "drop",
    tone: "amber",
    links: ["ENGINE OIL", "ATF", "CVTF", "COOLANT"],
  },
  { title: "WIPER BLADE", icon: "wave", tone: "cyan", links: [] },
  { title: "HORN", icon: "horn", tone: "orange", links: [] },
  { title: "BATTERY", icon: "battery", tone: "green", links: [] },
  { title: "SPARK PLUG", icon: "bolt", tone: "purple", links: [] },
  { title: "SHOCK ABSORBER", icon: "pulse", tone: "indigo", links: [] },
  { title: "ENGINE PARTS", icon: "gear", tone: "red", links: [] },
];

const tyreBrands = [
  "YOKOHAMA",
  "BRIDGESTONE",
  "PIRELLI",
  "GOODYEAR",
  "MICHELIN",
  "DUNLOP",
  "MAXXIS",
  "CONTINENTAL",
  "HANKOOK",
  "OTHER BRANDS",
];

const rimSizes = ["13 INCH", "14 INCH", "15 INCH", "16 INCH", "17 INCH", "18 INCH", "19 INCH", "20 INCH", "21 INCH", "22 INCH"];

const lubricantCategories = [
  {
    title: "Engine Oil",
    icon: "fuel",
    tone: "orange",
    links: ["5W-30", "0W-20", "5W-40", "0W-40", "10W-30", "10W-40", "20W-50"],
  },
  {
    title: "Transmission Fluid",
    icon: "gear",
    tone: "blue",
    links: ["ATF", "CVT Fluid", "Manual Trans"],
  },
  {
    title: "Coolant",
    icon: "drop",
    tone: "teal",
    links: ["Ready-to-Use", "Concentrate", "Universal"],
  },
];

const lubricantBrands = ["ELF", "Shell", "Mobil 1", "Liqui Moly", "Ravenol", "Totachi", "Idemitsu", "OTHER BRANDS"];

const premiumBrands = [
  { name: "DENSO", short: "DENSO", color: "bg-[#ed1f24] text-white" },
  { name: "Shell", short: "SH", color: "bg-white text-[#d71920] border border-[#f7d95f]" },
  { name: "Mobil 1", short: "Mobil 1", color: "bg-white text-[#1f315f]" },
  { name: "Brembo", short: "brembo", color: "bg-[#e12526] text-white" },
  { name: "Bridgestone", short: "MICHELIN", color: "bg-white text-[#1453a6]" },
  { name: "AKEBONO", short: "AKEBONO", color: "bg-white text-[#2270a8]" },
  { name: "Advics", short: "ADVICS", color: "bg-white text-[#24436b]" },
  { name: "Bizol", short: "BI", color: "bg-white text-[#d71920] border border-[#f7d95f]" },
];

const automotiveInsights = [
  {
    title: "When Was the Last Time Your Tires Were Rotated and Balanced?",
    date: "September 2, 2025",
    readTime: "2min",
    excerpt: "Tires are a critical safety component of your vehicle, and their condition directly impacts performance, handling, and fuel...",
    image: "/product-detail-reference.jpg",
    position: "42% 20%",
  },
  {
    title: "10 Road Safety Tips for Driving Your Car in the Rain",
    date: "June 26, 2025",
    readTime: "3min",
    excerpt: "Driving during the rainy season can be a stressful experience—even for the most seasoned drivers. Wet roads, poor...",
    image: "/black-odor-red-console.jpg",
    position: "center",
  },
  {
    title: "Changing Engine Oil",
    date: "October 27, 2022",
    readTime: "4min",
    excerpt: "Changing your vehicle's engine oil is not a difficult task, but it is one that must be done properly. Learn how To change oil...",
    image: "/japanparts-reference.png",
    position: "66% 45%",
  },
];

const categoryShowcase = [
  {
    title: "Genuine Auto Parts",
    items: [
      { label: "Brake Pads", crop: "bg-[-1082px_-494px]" },
      { label: "Shock Absorber", crop: "bg-[-1192px_-248px]" },
      { label: "Spark Plug", crop: "bg-[-1090px_-300px]" },
      { label: "Head Light Set", crop: "bg-[-1510px_-421px]" },
    ],
  },
  {
    title: "Premium Tyres",
    items: [
      { label: "Car Tyre", crop: "bg-[-1452px_-548px]" },
      { label: "SUV Tyre", crop: "bg-[-1512px_-580px]" },
      { label: "Performance Tyre", crop: "bg-[-1390px_-530px]" },
      { label: "Rim Size", crop: "bg-[-1458px_-500px]" },
    ],
  },
  {
    title: "Quality Lubricants",
    items: [
      { label: "Engine Oil", crop: "bg-[-1335px_-334px]" },
      { label: "Transmission Fluid", crop: "bg-[-1200px_-432px]" },
      { label: "Coolant", crop: "bg-[-1274px_-390px]" },
      { label: "By Brand", crop: "bg-[-1368px_-283px]" },
    ],
  },
  {
    title: "Car Accessories",
    items: [
      { label: "Car Care", crop: "bg-[-1204px_-537px]" },
      { label: "Body Parts", crop: "bg-[-1554px_-325px]" },
      { label: "Battery", crop: "bg-[-1294px_-492px]" },
      { label: "Wiper Blade", crop: "bg-[-1164px_-248px]" },
    ],
  },
];

const heroCategorySlider = [
  { label: "Brake System", icon: "🛑", href: "#brake-system" },
  { label: "Engine Parts", icon: "⚙️", href: "#engine-parts" },
  { label: "Tyres", icon: "🚙", href: "#tyres" },
  { label: "Lubricants", icon: "🛢️", href: "#lubricants" },
  { label: "Electrical Parts", icon: "⚡", href: "#electrical-parts" },
  { label: "Car Care Items", icon: "🧴", href: "#car-care-items" },
  { label: "Body Parts", icon: "🚗", href: "#body-parts" },
  { label: "Filters", icon: "🧰", href: "#filters" },
  { label: "Battery", icon: "🔋", href: "#battery" },
  { label: "Accessories", icon: "🧩", href: "#accessories" },
];

function Icon({ name, className = "size-5" }) {
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

function ChevronDown({ className = "size-3" }) {
  return (
    <svg className={className} viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m1 1.5 5 5 5-5" />
    </svg>
  );
}

function categoryTone(tone) {
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

function iconTone(tone) {
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

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function CategoryCard({ category }) {
  return (
    <article className={`group/card min-h-[134px] rounded-[7px] border border-[#eeeeee] bg-white p-3.5 transition duration-200 hover:-translate-y-0.5 ${categoryTone(category.tone)}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-8 shrink-0 place-items-center rounded-[7px] ${iconTone(category.tone)}`}>
          <Icon name={category.icon} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <a href={`#${slugify(category.title)}`} className="block text-[14px] font-black leading-[1.1] text-[#111827] transition group-hover/card:text-current">
            {category.title}
          </a>
          <div className="mt-3 h-0.5 w-0 bg-current transition-all duration-200 group-hover/card:w-12" />
        </div>
      </div>
      {category.links.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-[12.5px] font-medium leading-4 text-[#1f2937]">
          {category.links.map((link) => (
            <li key={link}>
              <a
                href={`#${slugify(link)}`}
                className="flex items-center gap-1.5 rounded px-1.5 py-1 transition hover:bg-[#fff1f1] hover:text-current"
              >
                <span className="size-2 rounded-full border border-current opacity-60" />
                {link}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function MenuSectionCard({ title, icon, tone, links, children }) {
  return (
    <section className={`group/card min-h-[318px] rounded-[7px] border border-[#eeeeee] bg-white p-4 transition duration-200 hover:-translate-y-0.5 ${categoryTone(tone)}`}>
      <div className="mb-5 flex items-center gap-3">
        <span className={`grid size-8 shrink-0 place-items-center rounded-[7px] ${iconTone(tone)}`}>
          <Icon name={icon} className="size-4" />
        </span>
        <div>
          <a href={`#${slugify(title)}`} className="text-[14px] font-black leading-none text-[#111827] transition group-hover/card:text-current">
            {title}
          </a>
          <div className="mt-3 h-0.5 w-0 bg-current transition-all duration-200 group-hover/card:w-12" />
        </div>
      </div>
      {links && (
        <ul className="space-y-2 text-[12.5px] font-medium leading-4 text-[#1f2937]">
          {links.map((link) => (
            <li key={link}>
              <a href={`#${slugify(link)}`} className="flex items-center gap-1.5 transition hover:text-current">
                <span className="size-2 rounded-full border border-current opacity-60" />
                {link}
              </a>
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}

function PromoRail({ product, offer }) {
  return (
    <aside className="space-y-4">
      <div className="rounded-[7px] bg-gradient-to-br from-[#251a2a] to-[#332238] p-4 text-white">
        <p className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.11em] text-[#ff7070]">
          <Icon name="star" className="size-3.5" />
          Authentic Japanese
        </p>
        <h3 className="mt-2 text-[18px] font-black leading-5">{product}</h3>
        <p className="mt-1 text-[12px] text-[#ff7777]">Guaranteed Fitment</p>
        <a href="#featured-products" className="mt-3 grid h-[66px] place-items-center rounded-[6px] border border-white/25 bg-[#e5e7eb] text-[13px] font-medium text-[#374151] shadow-[inset_0_0_0_7px_rgba(31,41,55,0.26)]">
          Featured Products
        </a>
        <a href="#parts" className="mt-3 grid h-8 place-items-center rounded-[7px] bg-[#f73438] text-[12px] font-black text-[#090909] transition hover:bg-[#ff4a4d]">
          Shop Now
        </a>
      </div>
      <div className="rounded-[7px] bg-[#f33438] p-3 text-white">
        <p className="text-[13px] font-black uppercase leading-4">% LIMITED TIME</p>
        <p className="text-[15px] font-black uppercase leading-4">{offer}</p>
        <p className="text-[12px] leading-4 text-[#3f1a1b]">Code: JAPAN15</p>
        <button className="mt-2 h-[26px] w-full rounded bg-white text-[12px] font-black text-[#e12526] transition hover:bg-[#fff1f1]">
          Claim Discount
        </button>
      </div>
      <div className="space-y-2 text-[12.5px] font-semibold">
        <div className="rounded-[7px] border border-[#b7efd4] bg-[#e9fff3] px-2 py-2 text-[#057a55]">
          <span className="font-black">↻ 100% Authentic</span>
          <span className="block font-medium">Genuine Japanese Parts</span>
        </div>
        <div className="rounded-[7px] border border-[#c9ddff] bg-[#edf5ff] px-2 py-2 text-[#1d4ed8]">
          <span className="font-black">▣ Fast Shipping</span>
          <span className="block font-medium">Same Day Processing</span>
        </div>
        <div className="rounded-[7px] border border-[#ffd2d2] bg-[#fff1ec] px-2 py-2 text-[#e12526]">
          ♡ Quality Guarantee
        </div>
      </div>
    </aside>
  );
}

function CarPartsMegaMenu() {
  return (
    <div className="mega-menu invisible absolute left-[calc(50%-696px)] top-full z-50 min-h-[569px] w-[1272px] rounded-b-[10px] bg-white p-6 text-[#111827] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition duration-150 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100 max-xl:left-6 max-xl:w-[calc(100vw-48px)] max-lg:hidden">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-[7px] bg-[#ff474b] text-[#111827]">
          <Icon name="package" className="size-4" />
        </span>
        <div>
          <h2 className="text-[18px] font-black leading-5">Genuine Auto Parts</h2>
          <div className="mt-4 h-0.5 w-12 bg-[#ed1f24]" />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_203px] gap-6">
        <div className="grid grid-cols-5 gap-4">
          {carPartCategories.map((category) => (
            <CategoryCard key={category.title} category={category} />
          ))}
        </div>
        <PromoRail product="Parts" offer="15% Off Car Parts" />
      </div>
      <MegaMenuCta href="/car-parts" eyebrow="Genuine Auto Parts" text="Browse brakes, filters, electrical, suspension and engine parts." buttonText="View All Car Parts" />
    </div>
  );
}

function TyresMegaMenu() {
  return (
    <div className="mega-menu invisible absolute left-[calc(50%-696px)] top-full z-50 min-h-[569px] w-[1272px] rounded-b-[10px] bg-white p-6 text-[#111827] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition duration-150 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100 max-xl:left-6 max-xl:w-[calc(100vw-48px)] max-lg:hidden">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-[7px] bg-[#ff474b] text-[#111827]">
          <Icon name="package" className="size-4" />
        </span>
        <div>
          <h2 className="text-[18px] font-black leading-5">Premium Tyres</h2>
          <div className="mt-4 h-0.5 w-12 bg-[#ed1f24]" />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_203px] gap-6">
        <div className="grid grid-cols-[2.05fr_1fr] gap-4">
          <section className="group/card rounded-[7px] border border-[#eeeeee] bg-white p-4 text-[#9b35ff] transition duration-200 hover:-translate-y-0.5 hover:border-[#c58cff] hover:bg-[#fcf7ff] hover:shadow-[0_10px_24px_rgba(155,53,255,0.14)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-[7px] bg-[#f8efff] text-[#9b35ff]">
                <Icon name="star" className="size-4" />
              </span>
              <div>
                <a href="#tyres-by-brand" className="text-[14px] font-black leading-none text-[#111827] transition group-hover/card:text-current">
                  BY BRAND
                </a>
                <div className="mt-3 h-0.5 w-0 bg-current transition-all duration-200 group-hover/card:w-12" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {tyreBrands.map((brand) => (
                <a key={brand} href={`#${slugify(brand)}`} className="flex items-center gap-3 text-[12.5px] font-medium text-[#1f2937] transition hover:text-current">
                  <span className="grid h-[18px] w-[54px] place-items-center rounded-[3px] border border-[#dfe3ea] bg-white px-1 text-[5.8px] font-black uppercase tracking-[-0.02em] text-[#111827] shadow-sm">
                    {brand}
                  </span>
                  {brand}
                </a>
              ))}
            </div>
          </section>

          <section className="group/card rounded-[7px] border border-[#eeeeee] bg-white p-4 text-[#ff7d34] transition duration-200 hover:-translate-y-0.5 hover:border-[#ffb26f] hover:shadow-[0_10px_24px_rgba(255,125,52,0.14)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-[7px] bg-[#fff5e9] text-[#ff7d34]">
                <Icon name="gear" className="size-4" />
              </span>
              <div>
                <a href="#tyres-by-rim-size" className="text-[14px] font-black leading-none text-[#111827] transition group-hover/card:text-current">
                  BY RIM SIZE
                </a>
                <div className="mt-3 h-0.5 w-0 bg-current transition-all duration-200 group-hover/card:w-12" />
              </div>
            </div>
            <ul className="space-y-2 text-[12.5px] font-medium leading-4 text-[#1f2937]">
              {rimSizes.map((size) => (
                <li key={size}>
                  <a href={`#${slugify(size)}`} className="flex items-center gap-1.5 transition hover:text-current">
                    <span className="size-2 rounded-full border border-current opacity-60" />
                    {size}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <PromoRail product="Premium Tyres" offer="15% Off Tyres" />
      </div>
      <MegaMenuCta href="/tyres" eyebrow="Premium Tyres" text="Browse tyres by brand, rim size, tyre care and accessories." buttonText="View All Tyres" />
    </div>
  );
}

function LubricantMegaMenu() {
  return (
    <div className="mega-menu invisible absolute left-[calc(50%-696px)] top-full z-50 min-h-[569px] w-[1272px] rounded-b-[10px] bg-white p-6 text-[#111827] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition duration-150 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100 max-xl:left-6 max-xl:w-[calc(100vw-48px)] max-lg:hidden">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-[7px] bg-[#ff474b] text-[#111827]">
          <Icon name="package" className="size-4" />
        </span>
        <div>
          <h2 className="text-[18px] font-black leading-5">Quality Lubricants</h2>
          <div className="mt-4 h-0.5 w-12 bg-[#ed1f24]" />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_203px] gap-6">
        <div className="grid grid-cols-4 gap-4">
          {lubricantCategories.map((category) => (
            <MenuSectionCard key={category.title} {...category} />
          ))}
          <MenuSectionCard title="By Brand" icon="tag" tone="purple">
            <div className="space-y-3 text-[12.5px] font-medium leading-4 text-[#1f2937]">
              {lubricantBrands.map((brand) => (
                <a key={brand} href={`#${slugify(brand)}`} className="flex items-center gap-3 transition hover:text-current">
                  <span className="grid h-[20px] w-[56px] place-items-center rounded-[3px] border border-[#dfe3ea] bg-white px-1 text-[7px] font-black uppercase tracking-[-0.02em] text-[#111827] shadow-sm">
                    {brand}
                  </span>
                  {brand}
                </a>
              ))}
            </div>
          </MenuSectionCard>
        </div>
        <PromoRail product="Pro Grade Lubricants" offer="15% Off Lubricant" />
      </div>
      <MegaMenuCta href="/lubricant" eyebrow="Quality Lubricants" text="Browse engine oil, transmission fluid, coolant and brand collections." buttonText="View All Lubricants" />
    </div>
  );
}

function MegaMenuCta({ href, eyebrow, text, buttonText }) {
  return (
    <div className="mt-5 flex items-center justify-between rounded-[10px] border border-[#ffd9d9] bg-[#fff5f5] p-4">
      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#ef3338]">{eyebrow}</p>
        <p className="mt-1 text-[15px] font-bold text-[#111827]">{text}</p>
      </div>
      <a href={href} className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#ef3338] px-5 text-[14px] font-black text-white transition hover:bg-[#d3191d]">
        {buttonText}
        <Icon name="arrow" className="size-4" />
      </a>
    </div>
  );
}

function CarAccessoriesMegaMenu() {
  return (
    <div className="invisible absolute left-[calc(50%-696px)] top-full z-[120] min-h-[569px] w-[1272px] translate-y-0 rounded-b-[10px] bg-white px-6 py-6 text-[#111827] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition duration-200 group-hover/nav:visible group-hover/nav:opacity-100 max-xl:left-6 max-xl:w-[calc(100vw-48px)] max-lg:hidden">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-[8px] bg-[#ffefef] text-[#ef3338]">
          <Icon name="car" className="size-4" />
        </span>
        <div>
          <h3 className="text-[18px] font-black leading-none">Car Accessories</h3>
          <span className="mt-3 block h-0.5 w-12 bg-[#ef3338]" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-4">
        {carAccessorySubcategories.map((category) => (
          <CategoryCard key={category.title} category={category} />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-[10px] border border-[#ffd9d9] bg-[#fff5f5] p-4">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#ef3338]">Accessories Collection</p>
          <p className="mt-1 text-[15px] font-bold text-[#111827]">Browse interior, exterior, electronics, care and lifestyle items.</p>
        </div>
        <a href="/car-accessories" className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#ef3338] px-5 text-[14px] font-black text-white transition hover:bg-[#d3191d]">
          View All Accessories
          <Icon name="arrow" className="size-4" />
        </a>
      </div>
    </div>
  );
}

function LogoMark({ logo }) {
  return <DynamicLogoMark logo={logo} />;
}

function TopSearch({ placeholderTexts }) {
  return <HeaderSearch vehicleBrands={vehicleBrands} placeholderTexts={placeholderTexts} />;
}

export function MainNavBar({ showTrackOrder = true }) {
  return (
    <div className="relative z-[90] border-t border-[#111827]/40 bg-[#d3191d] text-white">
      <div className="mx-auto flex h-[48px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10 max-lg:h-auto max-lg:flex-wrap max-lg:py-2">
        <nav className="flex min-w-0 flex-1 items-center gap-[18px] overflow-visible text-[14px] font-bold leading-none max-xl:gap-3 max-xl:text-[13px] max-lg:w-full max-lg:flex-none max-lg:gap-4 max-lg:overflow-x-auto max-lg:pb-2 max-sm:text-[13px]">
          {navItems.map((item) => (
            item.label === "CAR ACCESSORIES" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <CarAccessoriesMegaMenu />
              </div>
            ) : item.label === "CAR PARTS" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <CarPartsMegaMenu />
              </div>
            ) : item.label === "TYRES" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <TyresMegaMenu />
              </div>
            ) : item.label === "LUBRICANT" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <LubricantMegaMenu />
              </div>
            ) : (
              <a key={item.label} href={item.href} className="inline-flex h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition hover:bg-[#dd3b3f] hover:!text-[#f7d95f]">
                <span className="leading-none">{item.label}</span>
                {item.hasMenu && <ChevronDown className="size-[11px] translate-y-px" />}
              </a>
            )
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-4 text-[14px] font-bold text-white max-xl:gap-3 max-xl:text-[13px] max-lg:w-full max-lg:justify-end max-lg:gap-5 max-sm:text-[13px]">
          <Link href="/help" className="inline-flex h-[34px] items-center gap-2 rounded-[7px] px-2 leading-none transition hover:bg-[#dd3b3f] hover:text-[#f7d95f]">
            <Icon name="headphones" className="size-5" />
            <span className="leading-none">HELP</span>
          </Link>
          <div className="group/app relative flex h-[48px] items-center max-lg:h-auto">
            <button type="button" className="inline-flex h-[34px] items-center gap-2 rounded-[7px] px-2 leading-none transition group-hover/app:bg-[#dd3b3f] group-hover/app:text-[#f7d95f]">
              <span className="leading-none">DOWNLOAD APP</span>
              <ChevronDown className="size-[11px] translate-y-px transition group-hover/app:rotate-180" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-[455px] translate-y-2 rounded-[10px] border border-[#e5e7eb] bg-white p-6 text-[#111827] opacity-0 shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition duration-200 before:absolute before:-top-3 before:right-[116px] before:size-6 before:rotate-45 before:bg-white before:shadow-[-1px_-1px_0_0_#e5e7eb] group-hover/app:visible group-hover/app:translate-y-0 group-hover/app:opacity-100 max-sm:right-auto max-sm:left-0 max-sm:w-[calc(100vw-32px)] max-sm:p-4">
              <div className="relative z-10 flex items-center gap-6 max-sm:gap-4">
                <div className="grid size-[138px] shrink-0 grid-cols-7 grid-rows-7 gap-1 bg-white p-2 shadow-[inset_0_0_0_1px_#111827] max-sm:size-[116px]">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span
                      key={index}
                      className={`${[0, 1, 2, 4, 6, 7, 9, 10, 12, 13, 14, 16, 18, 21, 22, 23, 25, 27, 28, 30, 32, 34, 35, 36, 38, 40, 42, 43, 45, 46, 48].includes(index) ? "bg-[#111827]" : "bg-white"}`}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[18px] font-black leading-tight text-[#111827] max-sm:text-[16px]">Download The JPSPARE App</h4>
                  <p className="mt-3 text-[13px] font-medium leading-6 text-[#4b5563] max-sm:text-[12px] max-sm:leading-5">
                    Scan the QR code with your phone camera or any QR code scanner
                  </p>
                  <div className="mt-4 flex gap-2 max-sm:flex-col">
                    <a href="#download-ios" className="flex h-10 items-center justify-center gap-2 rounded-[5px] bg-black px-3 text-[11px] font-bold leading-none text-white transition hover:bg-[#1f2937]">
                      <span className="text-[18px]">●</span>
                      <span><span className="block text-[8px] font-medium">Download on the</span>App Store</span>
                    </a>
                    <a href="#download-android" className="flex h-10 items-center justify-center gap-2 rounded-[5px] bg-black px-3 text-[11px] font-bold leading-none text-white transition hover:bg-[#1f2937]">
                      <span className="text-[18px] text-[#37d160]">▶</span>
                      <span><span className="block text-[8px] font-medium">GET IT ON</span>Google Play</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showTrackOrder && (
            <Link href="/track-order" className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[11px] bg-white px-[16px] text-[14px] font-black leading-none !text-[#111827] transition hover:bg-[#fff2f2] max-xl:px-3 max-sm:h-9 max-sm:px-4 max-sm:text-[12px]">
              <Icon name="package" className="size-4 !text-[#111827]" />
              <span className="leading-none !text-[#111827]">Track Order</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function Header({ settings }) {
  return (
    <>
      <div className="sticky top-0 z-[100] bg-[#111827] text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
        <SearchHeaderBar settings={settings} />
      </div>
      <MainNavBar />
    </>
  );
}

function SearchHeaderBar({ settings }) {
  return (
    <div className="mx-auto flex h-[82px] w-full max-w-[1600px] items-center gap-8 px-4 sm:px-6 lg:px-8 xl:px-10 max-lg:h-auto max-lg:flex-wrap max-lg:gap-4 max-lg:py-3">
      <LogoMark logo={settings?.logo} />
      <TopSearch placeholderTexts={settings?.searchPlaceholders} />
      <div className="hidden shrink-0 items-center gap-5 text-white lg:flex">
        <Link href="/offers" className="header-action-icon soft-light-sweep rounded-[8px] px-1.5 py-1 flex items-center gap-2.5">
          <Icon name="gift" className="size-7 text-white" />
          <span className="leading-none">
            <span className="block text-[16px] font-black">Offers</span>
            <span className="mt-1 block text-[12px] font-medium text-white">Latest Offers</span>
          </span>
        </Link>
        <Link href="/eid-deal" className="header-action-icon soft-light-sweep rounded-[8px] px-1.5 py-1 flex items-center gap-2.5">
          <Icon name="flashSolid" className="eid-deal-flash size-6 text-white" />
          <span className="leading-none">
            <span className="block text-[16px] font-black">Eid Deal</span>
            <span className="mt-1 block text-[12px] font-medium text-white">Special Deals</span>
          </span>
        </Link>
      </div>
      <span className="hidden h-8 w-px shrink-0 bg-[#111827] lg:block" />
      <div className="hidden items-center gap-6 text-white lg:flex">
        <Link href="/wishlisht" aria-label="Wishlist" className="header-action-icon relative">
          <Icon name="heart" className="size-7" />
          <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#111827] text-[11px] font-black leading-none text-white">0</span>
        </Link>
        <Link href="/compare" aria-label="Compare products" title="Compare products" className="header-action-icon relative z-10 grid size-8 place-items-center">
          <Icon name="trend" className="size-7" />
        </Link>
        <HeaderCartButton />
        <HeaderAccountButton />
      </div>
      <button className="ml-auto hidden text-white max-lg:block" aria-label="Open menu">
        <Icon name="menu" className="size-7" />
      </button>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b-4 border-[#e1272b] bg-[#040404]">
      <HeroBannerSlider fallbackSlides={heroSlides} />
    </section>
  );
}

function TrustStrip() {
  return (
    <section id="about" className="border-b border-[#e5e7eb] bg-[#f7f8fa] py-6">
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
              <Icon name={item.icon} className="size-4.5" />
            </span>
            <h2 className="mt-3 text-[15px] font-black leading-[1.2] text-[#111827]">{item.title}</h2>
            <p className="mt-2 text-[12.5px] leading-[1.5] text-[#4b5563]">{item.text}</p>
            <ul className="mt-3 space-y-1.5">
              {item.points.map((point) => (
                <li key={point} className="flex items-center gap-1.5 text-[11px] font-medium leading-snug text-[#6b7280]">
                  <Icon name="check" className="size-3 shrink-0 text-[#10b981]" />
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

function HeroCategorySlider() {
  return (
    <section className="border-b border-[#f3d7df] bg-white py-3">
      <div className="category-marquee relative overflow-hidden">
        <div className="category-marquee-track flex w-max items-center">
          {[0, 1, 2, 3].map((group) => (
            <div key={group} className="flex shrink-0 items-center gap-2 pr-2">
              {heroCategorySlider.map((item) => (
                <a
                  key={`${item.label}-${group}`}
                  href={item.href}
                  className="flex h-9 shrink-0 items-center gap-2 rounded-[4px] bg-[#ffe5ee] px-3.5 text-[14px] font-black leading-none text-[#2b2529] shadow-[inset_0_0_0_1px_rgba(255,216,226,0.9)] transition hover:bg-[#ffd5e3] hover:text-[#d41667]"
                >
                  <span className="text-[17px] leading-none">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase() {
  return (
    <section id="categories" className="bg-white py-20 max-sm:py-14">
      <div className="mx-auto mb-14 w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 text-center max-sm:mb-10">
        <div className="soft-light-sweep inline-flex h-[44px] items-center gap-2 rounded-[10px] bg-[#ef3338] px-7 text-[14px] font-black uppercase tracking-[0.04em] text-white shadow-[0_14px_28px_rgba(220,38,38,0.24)] max-sm:h-auto max-sm:px-5 max-sm:py-3 max-sm:text-[12px]">
          <span className="text-[17px]">☆</span>
          Handpicked Category
        </div>
        <h2 className="mt-8 text-[48px] font-black leading-none tracking-[-0.06em] text-[#111827] max-lg:text-[40px] max-sm:text-[30px]">
          <span>Organized By Category <span className="text-[#df2026]">For</span></span>
          <span className="block text-[#df2026]">Easy Shopping</span>
        </h2>
        <span className="mx-auto mt-7 block h-1 w-24 rounded-full bg-[#ef3338]" />
      </div>
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8 xl:px-10 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {categoryShowcase.map((group) => (
          <article key={group.title} className="rounded-[6px] border border-[#dfe4ea] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#f7b1c9] hover:shadow-[0_14px_28px_rgba(236,0,116,0.09)]">
            <h2 className="mb-[14px] text-[16px] font-black leading-5 text-[#ec0074]">{group.title}</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-[15px]">
              {group.items.map((item) => (
                <a key={item.label} href={`#${slugify(item.label)}`} className="group/category block">
                  <div className={`h-[105px] rounded-[7px] bg-[#f2f2f2] bg-[url('/japanparts-reference.png')] bg-[length:1920px_957px] bg-no-repeat ${item.crop} transition duration-200 group-hover/category:scale-[1.015] group-hover/category:shadow-[0_8px_18px_rgba(15,23,42,0.12)] max-sm:h-[135px]`} />
                  <p className="mt-[7px] text-[15px] font-medium leading-5 text-[#4b5563] transition group-hover/category:text-[#ec0074]">{item.label}</p>
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServiceBanner() {
  return (
    <section className="bg-[#f5f6f8] py-0">
      <div className="service-banner relative min-h-[460px] overflow-hidden bg-[#060912] text-white">
        <div className="absolute inset-0 bg-[url('/japanparts-reference.png')] bg-[length:1920px_957px] bg-center opacity-25 blur-[1px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_54%,rgba(122,40,83,0.25),transparent_32%),radial-gradient(circle_at_83%_42%,rgba(128,22,48,0.35),transparent_30%),linear-gradient(90deg,rgba(7,10,18,0.86),rgba(7,10,18,0.72),rgba(7,10,18,0.9))]" />
        <div className="relative z-10 mx-auto flex min-h-[460px] w-full max-w-[1600px] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
          <div className="mb-[28px] inline-flex h-[44px] items-center gap-2 rounded-full border border-[#8d2c37] bg-[#3a171d]/80 px-6 text-[14px] font-black uppercase tracking-[0.12em] text-[#ff7777]">
            <Icon name="star" className="size-4" />
            Premium Service
          </div>
          <h2 className="max-w-[880px] text-[48px] font-black leading-[1.25] tracking-[-0.035em] max-sm:text-[34px]">
            Why Choose JPSPARE Direct
            <span className="block text-[#ff4549]">Excellence Delivered</span>
          </h2>
          <p className="mt-[24px] max-w-[720px] text-[19px] leading-[1.45] text-[#d8dbe2]">
            Experience the difference with our comprehensive automotive solutions and unmatched customer service.
          </p>
        </div>
      </div>
    </section>
  );
}

function BrakeOfferBanner() {
  return (
    <section className="bg-white px-4 sm:px-6 lg:px-8 xl:px-10 py-12">
      <div className="mx-auto w-full max-w-[1600px] overflow-hidden rounded-[9px] bg-black text-white">
        <div className="relative min-h-[128px] bg-[url('/japanparts-reference.png')] bg-[length:1920px_957px] bg-[center_-390px] bg-no-repeat">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.70)_45%,rgba(0,0,0,0.95)_100%)]" />
          <div className="relative z-10 flex min-h-[128px] items-center gap-6 px-8 max-lg:flex-wrap max-lg:py-6 max-sm:px-5">
            <span className="shrink-0 rounded-full border border-[#9a4a13] bg-[#261205] px-4 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#f3a851]">Special Offer</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-[24px] font-black leading-none tracking-[-0.02em] max-sm:text-[20px]">Performance Brake Systems</h2>
                <span className="rounded-full bg-[#ff4b50] px-3 py-1 text-[13px] font-black">-35%</span>
              </div>
              <p className="mt-4 text-[16px] leading-6 text-[#d1d5db] max-sm:text-[14px]">High-performance brake pads and rotors. Professional installation guides included.</p>
            </div>
            <div className="flex shrink-0 items-center gap-4 max-sm:w-full max-sm:flex-col">
              <span className="grid h-[50px] place-items-center rounded-[9px] bg-[#ff6a13] px-6 text-[18px] font-black max-sm:w-full">Save ৳5,000</span>
              <a href="#best-selling-parts" className="flex h-[50px] items-center justify-center gap-3 rounded-[9px] bg-[#ef2d32] px-7 text-[16px] font-black transition hover:bg-[#d3191d] max-sm:w-full">
                Upgrade Brakes
                <Icon name="arrow" className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumBrandsSection() {
  return (
    <section id="brands" className="bg-[#f5f6f8] py-24 max-sm:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
        <div className="inline-flex h-[58px] items-center gap-3 rounded-full border border-[#ff9b9d] bg-[#fff1f1] px-9 text-[15px] font-black uppercase tracking-[0.08em] text-[#c51f24] shadow-[0_16px_30px_rgba(15,23,42,0.10)] max-sm:h-auto max-sm:px-5 max-sm:py-3 max-sm:text-[12px]">
          <Icon name="bolt" className="size-5" />
          Premium Partners
        </div>
        <h2 className="mt-9 text-[58px] font-black leading-none tracking-[-0.06em] text-[#111827] max-md:text-[44px] max-sm:text-[36px]">
          Shop Premium <span className="text-[#f1461d]">Brands</span>
        </h2>
        <p className="mx-auto mt-8 max-w-[760px] text-[21px] leading-[1.55] text-[#4b5563] max-sm:text-[16px]">
          Discover authentic Japanese automotive parts from world-renowned manufacturers. Click any brand to explore their exclusive collection of genuine OEM and aftermarket parts.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#9ee7bd] bg-[#ecfff4] px-4 py-2 text-[14px] font-medium text-[#079347]">
            <span className="size-3 rounded-full bg-[#35c878]" />
            Click to browse collections
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b9d3ff] bg-[#eef6ff] px-4 py-2 text-[14px] font-medium text-[#155dfc]">
            <Icon name="package" className="size-4" />
            1000+ authentic parts
          </span>
        </div>

        <div className="brand-marquee mt-14 overflow-hidden pb-4">
          <div className="brand-marquee-track flex w-max gap-8 max-sm:gap-4">
          {[...premiumBrands, ...premiumBrands].map((brand, index) => (
            <a
              key={`${brand.name}-${index}`}
              href={`#${slugify(brand.name)}`}
              className="group/brand relative flex h-[94px] w-[128px] shrink-0 flex-col items-center justify-center rounded-[10px] border border-[#dfe4ea] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#f7d95f] hover:shadow-[0_16px_34px_rgba(220,38,38,0.12)]"
            >
              <span className="absolute right-1 top-1 size-3 rounded-full border-2 border-white bg-[#20c86b]" />
              <span className={`grid h-8 min-w-[60px] place-items-center rounded-[4px] px-2 text-[13px] font-black ${brand.color}`}>{brand.short}</span>
              <span className="mt-3 text-[12px] font-black text-[#1f2937] transition group-hover/brand:text-[#d3191d]">{brand.name}</span>
            </a>
          ))}
          </div>
        </div>

        <a href="#featured-products" className="mt-10 inline-flex h-[56px] items-center gap-3 rounded-full bg-gradient-to-r from-[#ff4247] to-[#ff7417] px-9 text-[16px] font-black text-white shadow-[0_16px_30px_rgba(220,38,38,0.18)] transition hover:brightness-105">
          Explore All Collections
          <Icon name="arrow" className="size-4" />
        </a>
      </div>
    </section>
  );
}

function AutomotiveInsightsSection() {
  return (
    <section id="automotive-insights" className="bg-white py-24 max-sm:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
        <h2 className="text-[48px] font-black leading-tight tracking-[-0.04em] text-[#111827] max-md:text-[40px] max-sm:text-[32px]">
          Expert Automotive Insights
        </h2>
        <p className="mx-auto mt-6 max-w-[720px] text-[19px] leading-[1.55] text-[#4b5563] max-sm:text-[16px]">
          Stay informed with the latest automotive trends, maintenance tips, and product guides from our experts.
        </p>

        <div className="mt-14 grid grid-cols-3 gap-8 max-lg:grid-cols-1">
          {automotiveInsights.map((article, index) => (
            <article
              key={article.title}
              id={`article-${index + 1}`}
              className="group overflow-hidden rounded-[12px] bg-white text-left shadow-[0_10px_28px_rgba(15,23,42,0.10)] ring-1 ring-[#edf0f3] transition duration-300 hover:-translate-y-1 hover:ring-[#f7d95f] hover:shadow-[0_18px_42px_rgba(220,38,38,0.13)]"
            >
              <a href={`#article-${index + 1}`} className="block">
                <div
                  className="relative h-[256px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${article.image})`, backgroundPosition: article.position }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#ff4247] px-4 py-2 text-[13px] font-black uppercase tracking-[0.04em] text-black">
                    General
                  </span>
                </div>
              </a>

              <div className="p-8 max-sm:p-6">
                <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#6b7280]">
                  <span className="inline-flex items-center gap-2">
                    <Icon name="calendar" className="size-4 text-[#ff4247]" />
                    {article.date}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Icon name="clock" className="size-4 text-[#ff4247]" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="mt-5 text-[24px] font-black leading-tight text-[#df1f24] transition group-hover:text-[#b91c1c] max-sm:text-[21px]">
                  <a href={`#article-${index + 1}`}>{article.title}</a>
                </h3>
                <p className="mt-5 text-[17px] leading-[1.6] text-[#4b5563]">{article.excerpt}</p>

                <a
                  href={`#article-${index + 1}`}
                  className="mt-7 inline-flex items-center gap-3 text-[16px] font-black text-[#ef2d32] transition hover:text-[#b91c1c]"
                >
                  Read Full Article
                  <Icon name="arrow" className="size-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <Link
          href="/blog"
          className="mt-12 inline-flex h-[58px] items-center justify-center gap-3 rounded-[10px] bg-[#ef2d32] px-9 text-[16px] font-black text-white shadow-[0_12px_24px_rgba(220,38,38,0.22)] transition hover:bg-[#d3191d]"
        >
          View All Articles
          <Icon name="arrow" className="size-4" />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <CompareHashRedirect />
      <TopDealBar />
      <Header />
      <Hero />
      <HeroCategorySlider />
      <TrustStrip />
      <CategoryShowcase />
      <ProductTabs />
      <ServiceBanner />
      <BestSellingAutoParts />
      <BrakeOfferBanner />
      <LatestJapaneseAutoParts />
      <CustomerReviews />
      <PremiumBrandsSection />
      <VideoGallery />
      <AutomotiveInsightsSection />
      <PartsInquirySection />
      <section id="parts" className="sr-only">
        <h2>Demo parts results</h2>
      </section>
      <section id="track-order" className="sr-only">
        <h2>Track order demo section</h2>
      </section>
    </main>
  );
}
