import Link from "next/link";
import TopDealBar from "./TopDealBar";
import ProductTabs, { BestSellingAutoParts, FeaturedOfferBanners, LatestJapaneseAutoParts } from "./ProductTabs";
import CustomerReviews from "./CustomerReviews";
import HeaderSearch from "./HeaderSearch";
import CompareHashRedirect from "./CompareHashRedirect";
import HeaderCompareButton from "./HeaderCompareButton";
import HeaderCartButton from "./HeaderCartButton";
import HeaderWishlistButton from "./HeaderWishlistButton";
import HeaderAccountButton from "./HeaderAccountButton";
import HeaderCategoryTreeClient from "./HeaderCategoryTreeClient";
import DynamicLogoMark from "./DynamicLogoMark";
import CategoryBrandRecommendations from "./CategoryBrandRecommendations";
import AccessoryRecommendationScroller from "./AccessoryRecommendationScroller";
import PartsQuoteModalLink from "./PartsQuoteModalLink";
import PartsInquirySection from "./PartsInquirySection";
import SlideManualControls from "./SlideManualControls";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "CAR ACCESSORIES", href: "/collections/car-accessories", hasMenu: true },
  { label: "CAR PARTS", href: "/collections/car-parts", hasMenu: true },
  { label: "TYRES", href: "/collections/tyres", hasMenu: true },
  { label: "LUBRICANT", href: "/collections/lubricant", hasMenu: true },
  { label: "BRANDS", href: "/brands" },
  { label: "MODIFICATION", href: "/modification" },
  { label: "COMBO PACKAGE", href: "/combo-package" },
  { label: "PARTS QUOTE", href: "/parts-quote" },
];

const carAccessorySubcategories = [
  { title: "Interior", icon: "car", tone: "red", links: ["Air Freshener", "Seat Covers", "Floor Mats"] },
  { title: "Exterior", icon: "body", tone: "blue", links: ["Car Cover", "Mud Guard", "Chrome Trim"] },
  { title: "Electronics", icon: "bolt", tone: "indigo", links: ["Phone Holder", "Dash Camera", "Chargers", "Reverse Camera", "GPS Tracker", "Parking Sensor", "Car DVR", "Bluetooth Adapter"] },
  { title: "Car Care", icon: "drop", tone: "teal", links: ["Wax", "Shampoo", "Washer Fluid"] },
  { title: "Utility", icon: "package", tone: "amber", links: ["Organizer", "Tool Kit", "Storage"] },
  { title: "Safety", icon: "check", tone: "green", links: ["Emergency Kit", "Reflector", "First Aid"] },
  { title: "Performance", icon: "trend", tone: "orange", links: ["Cleaner", "Additive", "Filter Care"] },
  { title: "Lifestyle", icon: "star", tone: "purple", links: ["Perfume", "Decor", "Travel"] },
];

const recommendedAccessories = [
  { label: "Air Fresheners", query: "air freshener", image: "/accessory-luxe-air-freshener.jpeg" },
  { label: "Phone Holders", query: "phone holder", image: "/accessory-wide-angle-holder.jpeg" },
  { label: "Car Wash", query: "car wash", image: "/accessory-windshield-washer.jpeg" },
  { label: "Car Care", query: "car care", image: "/accessory-ac-pro.jpeg" },
  { label: "Car Shampoo", query: "car shampoo", image: "/accessory-car-shampoo.jpeg" },
  { label: "Wireless Holders", query: "wireless holder", image: "/accessory-yesido-wireless-holder.jpeg" },
  { label: "Car Wax", query: "car wax", image: "/accessory-hard-wax.jpeg" },
  { label: "Air Care", query: "air care", image: "/accessory-air-freshener-yellow.jpeg" },
  { label: "Dashboard Holders", query: "dashboard holder", image: "/accessory-joyroom-holder.jpeg" },
  { label: "Car Mounts", query: "car mount", image: "/accessory-yesido-car-holder.jpeg" },
  { label: "AC Cleaners", query: "ac cleaner", image: "/accessory-ac-pro.jpeg" },
  { label: "Washer Fluid", query: "washer fluid", image: "/accessory-windshield-washer.jpeg" },
];

const recommendedCarParts = [
  { label: "Brake Pads", query: "brake pad", image: "/japanparts-reference.png" },
  { label: "Oil Filters", query: "oil filter", image: "/product-detail-reference.jpg" },
  { label: "Spark Plugs", query: "spark plug", image: "/products-reference.png" },
  { label: "Shock Absorbers", query: "shock absorber", image: "/japanparts-reference.png" },
  { label: "Head Lights", query: "head light set", image: "/product-gallery-reference.png" },
  { label: "Wiper Blades", query: "wiper blade", image: "/accessory-windshield-washer.jpeg" },
  { label: "Air Filters", query: "air filter", image: "/accessory-ac-pro.jpeg" },
  { label: "Battery", query: "battery", image: "/product-gallery-reference.png" },
  { label: "Fuel Pump", query: "fuel pump", image: "/japanparts-reference.png" },
  { label: "Horn", query: "horn", image: "/products-reference.png" },
  { label: "Engine Parts", query: "engine parts", image: "/product-detail-reference.jpg" },
  { label: "Body Kits", query: "body kit", image: "/japanparts-reference.png" },
];

const recommendedTyres = [
  { label: "Car Tyres", query: "car tyre", image: "/products-reference.png" },
  { label: "SUV Tyres", query: "suv tyre", image: "/products-reference.png" },
  { label: "Performance Tyres", query: "performance tyre", image: "/products-reference.png" },
  { label: "Rim Size", query: "rim size", image: "/japanparts-reference.png" },
  { label: "Valve Caps", query: "valve cap", image: "/accessory-wide-angle-holder.jpeg" },
  { label: "Tyre Repair", query: "tyre repair", image: "/japanparts-reference.png" },
  { label: "Wheel Cleaner", query: "wheel cleaner", image: "/accessory-hard-wax.jpeg" },
  { label: "Tyre Gauge", query: "tyre gauge", image: "/accessory-yesido-car-holder.jpeg" },
  { label: "Tubeless Valve", query: "tubeless valve", image: "/product-detail-reference.jpg" },
  { label: "Tyre Cover", query: "tyre cover", image: "/products-reference.png" },
  { label: "Nitrogen Cap", query: "nitrogen cap", image: "/accessory-yesido-wireless-holder.jpeg" },
  { label: "Wheel Nuts", query: "wheel nuts", image: "/japanparts-reference.png" },
];

const recommendedLubricants = [
  { label: "Engine Oil", query: "engine oil", image: "/products-reference.png" },
  { label: "5W-30 Oil", query: "5w-30", image: "/products-reference.png" },
  { label: "0W-20 Oil", query: "0w-20", image: "/products-reference.png" },
  { label: "Transmission Fluid", query: "transmission fluid", image: "/japanparts-reference.png" },
  { label: "Coolant", query: "coolant", image: "/accessory-windshield-washer.jpeg" },
  { label: "Liqui Moly", query: "liqui moly", image: "/product-detail-reference.jpg" },
  { label: "Mobil 1", query: "mobil 1", image: "/products-reference.png" },
  { label: "ELF Oil", query: "elf oil", image: "/products-reference.png" },
  { label: "Oil Additives", query: "oil additive", image: "/japanparts-reference.png" },
  { label: "Fuel Cleaner", query: "fuel cleaner", image: "/product-gallery-reference.png" },
  { label: "Brake Fluid", query: "brake fluid", image: "/japanparts-reference.png" },
  { label: "CVT Fluid", query: "cvt fluid", image: "/products-reference.png" },
];

const vehicleBrands = ["Toyota", "Honda", "Nissan", "Mitsubishi", "Suzuki"];

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

const menuCategorySlugs = ["car-accessories", "car-parts", "tyres", "lubricant"];
const fallbackMenuCategories = [
  { name: "Car Accessories", slug: "car-accessories", children: carAccessorySubcategories },
  { name: "Car Parts", slug: "car-parts", children: carPartCategories },
  { name: "Tyres", slug: "tyres", children: [] },
  { name: "Lubricant", slug: "lubricant", children: lubricantCategories },
];
const categoryIconCycle = ["disc", "bolt", "car", "filter", "drop", "package", "battery", "gear"];
const categoryToneCycle = ["red", "orange", "blue", "green", "teal", "purple", "amber", "indigo"];

function collectionHref(slug) {
  return `/collections/${encodeURIComponent(slug)}`;
}

function categoryTopLabel(category, fallback) {
  const children = category?.children?.length ? category.children : fallback?.children || [];
  return children.slice(0, 4).map((item) => item.name || item.title).filter(Boolean).join(" • ");
}

function normalizeMenuCategory(category, fallback) {
  if (!category?.children?.length) return fallback;

  return {
    ...category,
    children: category.children.map((child, index) => ({
      title: child.name,
      href: collectionHref(child.slug),
      icon: categoryIconCycle[index % categoryIconCycle.length],
      tone: categoryToneCycle[index % categoryToneCycle.length],
      links: (child.children || []).map((subCategory) => ({
        label: subCategory.name,
        href: collectionHref(subCategory.slug),
      })),
    })),
  };
}

function getMenuCategory(menuCategories, slug) {
  return menuCategories?.[slug] || fallbackMenuCategories.find((category) => category.slug === slug);
}

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

const categoryShowcase = [
  {
    title: "GENUINE AUTO PARTS",
    theme: {
      card: "border-[#ffd2d3] bg-[linear-gradient(180deg,#ffffff_0%,#fff3f3_100%)] before:bg-[#ef3338] hover:border-[#ffb6b9] hover:bg-[linear-gradient(180deg,#fffafa_0%,#ffeded_100%)] hover:shadow-[0_18px_36px_rgba(239,51,56,0.13)]",
      title: "text-[#ef3338] group-hover/showcase:text-[#d71920]",
      itemStroke: "group-hover/category:ring-2 group-hover/category:ring-[#ef3338]/45",
    },
    items: [
      { label: "Brake Pads", crop: "bg-[-1082px_-494px]" },
      { label: "Shock Absorber", crop: "bg-[-1192px_-248px]" },
      { label: "Spark Plug", crop: "bg-[-1090px_-300px]" },
      { label: "Head Light Set", crop: "bg-[-1510px_-421px]" },
    ],
  },
  {
    title: "CAR ACCESSORIES",
    theme: {
      card: "border-[#ffe2c4] bg-[linear-gradient(180deg,#ffffff_0%,#fff8ef_100%)] before:bg-[#ff7a1a] hover:border-[#ffc98c] hover:bg-[linear-gradient(180deg,#fffaf4_0%,#fff4e8_100%)] hover:shadow-[0_18px_36px_rgba(255,122,26,0.12)]",
      title: "text-[#e85f00] group-hover/showcase:text-[#d94f00]",
      itemStroke: "group-hover/category:ring-2 group-hover/category:ring-[#ff7a1a]/45",
    },
    items: [
      { label: "Car Care", crop: "bg-[-1204px_-537px]" },
      { label: "Body Parts", crop: "bg-[-1554px_-325px]" },
      { label: "Battery", crop: "bg-[-1294px_-492px]" },
      { label: "Wiper Blade", crop: "bg-[-1164px_-248px]" },
    ],
  },
  {
    title: "PREMIUM TYRES",
    theme: {
      card: "border-[#dbe8ff] bg-[linear-gradient(180deg,#ffffff_0%,#f2f7ff_100%)] before:bg-[#1453a6] hover:border-[#b9d3ff] hover:bg-[linear-gradient(180deg,#fafdff_0%,#edf5ff_100%)] hover:shadow-[0_18px_36px_rgba(20,83,166,0.12)]",
      title: "text-[#1453a6] group-hover/showcase:text-[#1f315f]",
      itemStroke: "group-hover/category:ring-2 group-hover/category:ring-[#1453a6]/45",
    },
    items: [
      { label: "Car Tyre", crop: "bg-[-1452px_-548px]" },
      { label: "SUV Tyre", crop: "bg-[-1512px_-580px]" },
      { label: "Performance Tyre", crop: "bg-[-1390px_-530px]" },
      { label: "Rim Size", crop: "bg-[-1458px_-500px]" },
    ],
  },
  {
    title: "QUALITY LUBRICANTS",
    theme: {
      card: "border-[#d5f2e5] bg-[linear-gradient(180deg,#ffffff_0%,#f1fff8_100%)] before:bg-[#16a34a] hover:border-[#a9e8ca] hover:bg-[linear-gradient(180deg,#fbfffd_0%,#e8fff3_100%)] hover:shadow-[0_18px_36px_rgba(22,163,74,0.12)]",
      title: "text-[#128a41] group-hover/showcase:text-[#0f7a38]",
      itemStroke: "group-hover/category:ring-2 group-hover/category:ring-[#16a34a]/45",
    },
    items: [
      { label: "Engine Oil", crop: "bg-[-1335px_-334px]" },
      { label: "Transmission Fluid", crop: "bg-[-1200px_-432px]" },
      { label: "Coolant", crop: "bg-[-1274px_-390px]" },
      { label: "By Brand", crop: "bg-[-1368px_-283px]" },
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
    <article className={`group/card min-h-[134px] rounded-[10px] border border-[#e7ebf0] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fffdfd] ${categoryTone(category.tone)}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-[9px] ring-1 ring-black/[0.03] ${iconTone(category.tone)}`}>
          <Icon name={category.icon} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <a href={`#${slugify(category.title)}`} className="block text-[14px] font-black leading-[1.1] text-[#111827] transition group-hover/card:text-current">
            {category.title}
          </a>
          <div className="mt-2.5 h-0.5 w-6 rounded-full bg-[#ef3338]/70 transition-all duration-200 group-hover/card:w-14 group-hover/card:bg-current" />
        </div>
      </div>
      {category.links.length > 0 && (
        <ul className="mt-4 grid gap-1.5 text-[12.5px] font-semibold leading-4 text-[#334155]">
          {category.links.map((link) => (
            <li key={link}>
              <a
                href={`#${slugify(link)}`}
                className="flex items-center gap-2 rounded-[7px] px-2 py-1.5 transition hover:bg-[#fff1f1] hover:text-[#ef3338]"
              >
                <span className="grid size-3 place-items-center rounded-full border border-[#ef3338]/30 bg-[#fff5f5]">
                  <span className="size-1 rounded-full bg-[#ef3338]" />
                </span>
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
        <a href="/collection" className="mt-3 grid h-[66px] place-items-center rounded-[6px] border border-white/25 bg-[#e5e7eb] text-[13px] font-medium text-[#374151] shadow-[inset_0_0_0_7px_rgba(31,41,55,0.26)]">
          Featured Products
        </a>
        <a href="/products" className="mt-3 grid h-8 place-items-center rounded-[7px] bg-[#f73438] text-[12px] font-black text-[#090909] transition hover:bg-[#ff4a4d]">
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

function MegaMenuShell({ topLabel, href, rootSlug, children }) {
  return (
    <div className="invisible absolute left-1/2 top-full z-[120] w-[calc(100%-80px)] max-w-[1640px] -translate-x-1/2 overflow-hidden rounded-b-[14px] border border-[#f0d5d8] bg-[#fbfcfd] text-[#111827] opacity-0 shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition duration-200 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100 max-lg:hidden">
      <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-[#f0d5d8] bg-[linear-gradient(90deg,#ffffff_0%,#fff7f7_62%,#fff0f0_100%)] px-7">
        <span data-menu-top-label={rootSlug} className="shrink-0 rounded-full border border-[#f7d95f]/70 bg-[#fffbea] px-4 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#8a5d00]">
          {topLabel}
        </span>
        <a
          href={href}
          data-menu-view-more={rootSlug}
          className="inline-flex h-8 shrink-0 items-center gap-2 rounded-[7px] bg-[#ef3338] px-4 text-[10px] font-black uppercase tracking-[0.04em] text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d]"
        >
          View More
          <Icon name="arrow" className="size-3" />
        </a>
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}

function MegaFeaturePanel({ icon, eyebrow, title, countLabel, eyebrowPosition = "top", children }) {
  return (
    <section className="rounded-[10px] border border-[#f0cfd2] bg-[linear-gradient(135deg,#fff8f8_0%,#ffffff_52%,#fff9f2_100%)] p-4 shadow-[0_14px_34px_rgba(220,38,38,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-[8px] bg-[#ef3338] text-white shadow-[0_8px_18px_rgba(239,51,56,0.25)]">
            <Icon name={icon} className="size-4" />
          </span>
          <div>
            {eyebrowPosition === "top" ? <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ef3338]">{eyebrow}</p> : null}
            <h4 className={eyebrowPosition === "top" ? "mt-0.5 text-[17px] font-black leading-none text-[#111827]" : "text-[17px] font-black leading-none text-[#111827]"}>{title}</h4>
            {eyebrowPosition === "bottom" ? <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#ef3338]">{eyebrow}</p> : null}
          </div>
        </div>
        <span className="rounded-full border border-[#f0cfd2] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#ef3338]">
          {countLabel}
        </span>
      </div>
      {children}
    </section>
  );
}

function MegaDropdownCard({ title, icon, tone = "red", links = [], href, cardIndex, children }) {
  const targetHref = href || `/products?category=${encodeURIComponent(slugify(title))}`;

  return (
    <section data-menu-card-index={cardIndex} className={`group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-1 hover:border-[#ef3338]/50 hover:shadow-[0_16px_30px_rgba(220,38,38,0.14)] hover:before:opacity-70 ${categoryTone(tone)}`}>
      <div className="flex items-start gap-2.5">
        <span className={`grid size-9 shrink-0 place-items-center rounded-[8px] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105 ${iconTone(tone)}`}>
          <Icon name={icon} className="size-4" />
        </span>
        <div className="min-w-0 pt-0.5">
          <a
            href={targetHref}
            data-menu-card-link
            className="block truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]"
            title={title}
          >
            {title}
          </a>
          <span className="mt-2 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
        </div>
      </div>
      {links.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {links.map((link, index) => (
            <li key={typeof link === "string" ? link : link.label}>
              <a
                href={typeof link === "string" ? collectionHref(slugify(link)) : link.href}
                data-menu-sub-link-index={index}
                className="flex items-center gap-2 truncate text-[12px] font-bold leading-4 text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]"
                title={typeof link === "string" ? link : link.label}
              >
                <span className="grid size-3 shrink-0 place-items-center rounded-full border border-[#ef3338]/40 bg-[#fff5f5]">
                  <span className="size-1 rounded-full bg-[#ef3338]" />
                </span>
                <span data-menu-sub-link-label className="truncate">{typeof link === "string" ? link : link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}

function MegaRecommendationBrandSplit({ recommendedItems, brandCategory, brandTitle = "Shop By Brand" }) {
  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-0.5 hover:border-[#ef3338]/50 hover:bg-[#fffdfd] hover:shadow-[0_16px_30px_rgba(220,38,38,0.12)] hover:before:opacity-70">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105">
            <Icon name="star" className="size-3.5" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]">Recommended</h4>
            <span className="mt-1.5 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
          </div>
        </div>
        <AccessoryRecommendationScroller items={recommendedItems} visibleCount={6} />
      </div>

      <div className="group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-0.5 hover:border-[#ef3338]/50 hover:bg-[#fffdfd] hover:shadow-[0_16px_30px_rgba(220,38,38,0.12)] hover:before:opacity-70">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105">
            <Icon name="tag" className="size-3.5" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]">{brandTitle}</h4>
            <span className="mt-1.5 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
          </div>
        </div>
        <CategoryBrandRecommendations category={brandCategory} limit={12} columns={6} logoSize={66} scrollable visibleCount={6} />
      </div>
    </section>
  );
}

function CarPartsMegaMenu({ category }) {
  const menuCategory = category || getMenuCategory(null, "car-parts");
  const menuItems = menuCategory.children || carPartCategories;

  return (
    <MegaMenuShell rootSlug="car-parts" topLabel={categoryTopLabel(menuCategory, getMenuCategory(null, "car-parts")) || "Brakes • Filters • Electrical • Engine"} href={collectionHref(menuCategory.slug)}>
      <div className="grid grid-cols-[minmax(0,1fr)_203px] gap-5">
        <div className="min-w-0 space-y-4">
          <MegaRecommendationBrandSplit recommendedItems={recommendedCarParts} brandCategory="car-parts" brandTitle="POPULAR BRAND" />
          <MegaFeaturePanel icon="package" eyebrow="BROWSE COLLECTION" title="SHOP BY CATEGORY" countLabel={`${menuItems.length} Categories`} eyebrowPosition="bottom">
            <div data-menu-grid="car-parts" className="grid grid-cols-6 gap-3">
              {menuItems.map((category, index) => (
                <MegaDropdownCard key={category.title} {...category} cardIndex={index} />
              ))}
            </div>
          </MegaFeaturePanel>
        </div>
        <PromoRail product="Parts" offer="15% Off Car Parts" />
      </div>
    </MegaMenuShell>
  );
}

function TyresMegaMenu({ category }) {
  const menuCategory = category || getMenuCategory(null, "tyres");
  const menuItems = menuCategory.children || [];

  return (
    <MegaMenuShell rootSlug="tyres" topLabel={categoryTopLabel(menuCategory, getMenuCategory(null, "tyres")) || "TYRES.RIM SIZE"} href={collectionHref(menuCategory.slug)}>
      <div className="grid grid-cols-[minmax(0,1fr)_203px] gap-5">
        <div className="min-w-0 space-y-4">
          <MegaRecommendationBrandSplit recommendedItems={recommendedTyres} brandCategory="tyres" brandTitle="POPULAR BRAND" />
          <MegaFeaturePanel icon="car" eyebrow="BROWSE COLLECTION" title="SHOP BY CATEGORY" countLabel="Tyre Finder" eyebrowPosition="bottom">
            {menuItems.length ? (
              <div data-menu-grid="tyres" className="grid grid-cols-6 gap-3">
                {menuItems.map((category, index) => (
                  <MegaDropdownCard key={category.title} {...category} cardIndex={index} />
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-[1.65fr_1fr] gap-3">
              <MegaDropdownCard title="By Brand" icon="star" tone="purple" href="/products?category=tyres">
                <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
                  {tyreBrands.map((brand) => (
                    <a key={brand} href={`/products?brand=${encodeURIComponent(slugify(brand))}`} className="flex items-center gap-3 text-[12px] font-bold text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]">
                      <span className="grid h-[22px] w-[60px] shrink-0 place-items-center rounded-[4px] border border-[#dfe3ea] bg-white px-1 text-[6px] font-black uppercase tracking-[-0.02em] text-[#111827] shadow-sm">
                        {brand}
                      </span>
                      <span className="truncate">{brand}</span>
                    </a>
                  ))}
                </div>
              </MegaDropdownCard>

              <MegaDropdownCard title="By Rim Size" icon="gear" tone="orange" href="/products?category=tyres">
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {rimSizes.map((size) => (
                    <li key={size}>
                      <a href={`/products?q=${encodeURIComponent(size)}`} className="flex items-center gap-2 truncate text-[12px] font-bold leading-4 text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]">
                        <span className="grid size-3 shrink-0 place-items-center rounded-full border border-[#ef3338]/40 bg-[#fff5f5]">
                          <span className="size-1 rounded-full bg-[#ef3338]" />
                        </span>
                        {size}
                      </a>
                    </li>
                  ))}
                </ul>
              </MegaDropdownCard>
            </div>
            )}
          </MegaFeaturePanel>
        </div>
        <PromoRail product="Premium Tyres" offer="15% Off Tyres" />
      </div>
    </MegaMenuShell>
  );
}

function LubricantMegaMenu({ category }) {
  const menuCategory = category || getMenuCategory(null, "lubricant");
  const menuItems = menuCategory.children || lubricantCategories;

  return (
    <MegaMenuShell rootSlug="lubricant" topLabel={categoryTopLabel(menuCategory, getMenuCategory(null, "lubricant")) || "Engine Oil • Transmission • Coolant"} href={collectionHref(menuCategory.slug)}>
      <div className="grid grid-cols-[minmax(0,1fr)_203px] gap-5">
        <div className="min-w-0 space-y-4">
          <MegaRecommendationBrandSplit recommendedItems={recommendedLubricants} brandCategory="lubricant" brandTitle="POPULAR BRAND" />
          <MegaFeaturePanel icon="drop" eyebrow="BROWSE COLLECTION" title="SHOP BY CATEGORY" countLabel="Quality Fluids" eyebrowPosition="bottom">
            <div data-menu-grid="lubricant" className="grid grid-cols-4 gap-3">
              {menuItems.map((category, index) => (
                <MegaDropdownCard key={category.title} {...category} cardIndex={index} />
              ))}
              <MegaDropdownCard title="By Brand" icon="tag" tone="purple" href="/products?category=lubricant">
                <div className="mt-4 space-y-2.5">
                  {lubricantBrands.map((brand) => (
                    <a key={brand} href={`/products?brand=${encodeURIComponent(slugify(brand))}`} className="flex items-center gap-3 text-[12px] font-bold text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]">
                      <span className="grid h-[22px] w-[60px] shrink-0 place-items-center rounded-[4px] border border-[#dfe3ea] bg-white px-1 text-[6.5px] font-black uppercase tracking-[-0.02em] text-[#111827] shadow-sm">
                        {brand}
                      </span>
                      <span className="truncate">{brand}</span>
                    </a>
                  ))}
                </div>
              </MegaDropdownCard>
            </div>
          </MegaFeaturePanel>
        </div>
        <PromoRail product="Pro Grade Lubricants" offer="15% Off Lubricant" />
      </div>
    </MegaMenuShell>
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

function CarAccessoriesMegaMenu({ category }) {
  const menuCategory = category || getMenuCategory(null, "car-accessories");
  const menuItems = menuCategory.children || carAccessorySubcategories;

  return (
    <div className="invisible absolute left-1/2 top-full z-[120] w-[calc(100%-80px)] max-w-[1640px] -translate-x-1/2 overflow-hidden rounded-b-[14px] border border-[#f0d5d8] bg-[#fbfcfd] text-[#111827] opacity-0 shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition duration-200 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100 max-lg:hidden">
      <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-[#f0d5d8] bg-[linear-gradient(90deg,#ffffff_0%,#fff7f7_62%,#fff0f0_100%)] px-7">
        <span data-menu-top-label="car-accessories" className="shrink-0 rounded-full border border-[#f7d95f]/70 bg-[#fffbea] px-4 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#8a5d00]">
          {categoryTopLabel(menuCategory, getMenuCategory(null, "car-accessories")) || "Interior • Exterior • Care • Lifestyle"}
        </span>
        <a
          href={collectionHref(menuCategory.slug)}
          data-menu-view-more="car-accessories"
          className="inline-flex h-8 shrink-0 items-center gap-2 rounded-[7px] bg-[#ef3338] px-4 text-[10px] font-black uppercase tracking-[0.04em] text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d]"
        >
          View More
          <Icon name="arrow" className="size-3" />
        </a>
      </div>
      <div className="p-7">
        <div className="grid grid-cols-[minmax(0,1fr)_203px] gap-5">
          <div className="min-w-0">
            <section className="grid grid-cols-2 gap-4">
              <div className="group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-0.5 hover:border-[#ef3338]/50 hover:bg-[#fffdfd] hover:shadow-[0_16px_30px_rgba(220,38,38,0.12)] hover:before:opacity-70">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105">
                    <Icon name="star" className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]">Recommended</h4>
                    <span className="mt-1.5 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
                  </div>
                </div>
                <AccessoryRecommendationScroller items={recommendedAccessories} visibleCount={6} />
              </div>

              <div className="group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-0.5 hover:border-[#ef3338]/50 hover:bg-[#fffdfd] hover:shadow-[0_16px_30px_rgba(220,38,38,0.12)] hover:before:opacity-70">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#fff1f2] text-[#ef3338] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105">
                    <Icon name="tag" className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]">Popular Brand</h4>
                    <span className="mt-1.5 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
                  </div>
                </div>
                <CategoryBrandRecommendations category="car-accessories" limit={12} columns={6} logoSize={66} scrollable visibleCount={6} />
              </div>
            </section>

            <section className="mt-4 rounded-[10px] border border-[#f0cfd2] bg-[linear-gradient(135deg,#fff8f8_0%,#ffffff_52%,#fff9f2_100%)] p-4 shadow-[0_14px_34px_rgba(220,38,38,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-[8px] bg-[#ef3338] text-white shadow-[0_8px_18px_rgba(239,51,56,0.25)]">
                    <Icon name="grid" className="size-4" />
                  </span>
                  <div>
                    <h4 className="text-[17px] font-black leading-none text-[#111827]">SHOP BY CATEGORY</h4>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#ef3338]">Browse Collection</p>
                  </div>
                </div>
                <span className="rounded-full border border-[#f0cfd2] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#ef3338]">
                  {menuItems.length} Categories
                </span>
              </div>

              <div data-menu-grid="car-accessories" className="grid grid-cols-6 gap-3">
                {menuItems.map((category, index) => (
                  <section
                    key={category.title}
                    data-menu-card-index={index}
                    className={`group/category relative min-w-0 overflow-hidden rounded-[8px] border border-[#e3e7ed] bg-white p-3.5 shadow-[0_7px_18px_rgba(15,23,42,0.055)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#ef3338] before:opacity-0 before:transition-opacity before:duration-200 hover:-translate-y-1 hover:border-[#ef3338]/50 hover:shadow-[0_16px_30px_rgba(220,38,38,0.14)] hover:before:opacity-70 ${categoryTone(category.tone)}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-[8px] ring-1 ring-black/[0.04] transition duration-200 group-hover/category:scale-105 ${iconTone(category.tone)}`}>
                        <Icon name={category.icon} className="size-4" />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <a
                          href={category.href || collectionHref(slugify(category.title))}
                          data-menu-card-link
                          className="block truncate text-[13px] font-black uppercase leading-[1.2] text-[#111827] transition group-hover/category:text-[#ef3338]"
                          title={category.title}
                        >
                          {category.title}
                        </a>
                        <span className="mt-2 block h-0.5 w-7 rounded-full bg-[#ef3338]/80 transition-all duration-200 group-hover/category:w-11 group-hover/category:bg-[#ef3338]" />
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2.5">
                      {category.links.map((link, index) => (
                        <li key={typeof link === "string" ? link : link.label}>
                          <a
                            href={typeof link === "string" ? collectionHref(slugify(link)) : link.href}
                            data-menu-sub-link-index={index}
                            className="flex items-center gap-2 truncate text-[12px] font-bold leading-4 text-[#334155] transition hover:translate-x-0.5 hover:text-[#ef3338]"
                            title={typeof link === "string" ? link : link.label}
                          >
                            <span className="grid size-3 shrink-0 place-items-center rounded-full border border-[#ef3338]/40 bg-[#fff5f5]">
                              <span className="size-1 rounded-full bg-[#ef3338]" />
                            </span>
                            <span data-menu-sub-link-label className="truncate">{typeof link === "string" ? link : link.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          </div>
          <PromoRail product="Accessories" offer="15% Off Accessories" />
        </div>
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

export function MainNavBar({ showTrackOrder = true, menuCategories }) {
  const categoryNavItems = navItems.map((item) => {
    const category = menuCategorySlugs.includes(slugify(item.label)) ? getMenuCategory(menuCategories, slugify(item.label)) : null;
    return category ? { ...item, label: category.name.toUpperCase(), href: collectionHref(category.slug) } : item;
  });

  return (
    <div className="relative z-[90] border-t border-[#111827]/40 bg-[#d3191d] text-white">
      <div className="mx-auto flex h-[48px] w-full max-w-[1720px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 max-lg:h-auto max-lg:flex-wrap max-lg:py-2">
        <nav className="flex min-w-0 flex-1 items-center gap-[18px] overflow-visible text-[14px] font-bold leading-none max-xl:gap-3 max-xl:text-[13px] max-lg:w-full max-lg:flex-none max-lg:gap-4 max-lg:overflow-x-auto max-lg:pb-2 max-sm:text-[13px]">
          {categoryNavItems.map((item) => (
            item.href === "/collections/car-accessories" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="car-accessories" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <CarAccessoriesMegaMenu category={getMenuCategory(menuCategories, "car-accessories")} />
              </div>
            ) : item.href === "/collections/car-parts" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="car-parts" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <CarPartsMegaMenu category={getMenuCategory(menuCategories, "car-parts")} />
              </div>
            ) : item.href === "/collections/tyres" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="tyres" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <TyresMegaMenu category={getMenuCategory(menuCategories, "tyres")} />
              </div>
            ) : item.href === "/collections/lubricant" ? (
              <div key={item.label} className="group/nav flex h-[48px] shrink-0 items-center max-lg:h-auto">
                <a href={item.href} data-menu-root="lubricant" className="inline-flex h-[32px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition group-hover/nav:bg-[#dd3b3f] group-hover/nav:!text-[#f7d95f]">
                  <span data-menu-root-label className="leading-none">{item.label}</span>
                  <ChevronDown className="size-[11px] translate-y-px transition group-hover/nav:rotate-180" />
                </a>
                <LubricantMegaMenu category={getMenuCategory(menuCategories, "lubricant")} />
              </div>
            ) : item.label === "PARTS QUOTE" ? (
              <PartsQuoteModalLink
                key={item.label}
                className="inline-flex h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition hover:bg-[#dd3b3f] hover:!text-[#f7d95f]"
              >
                {item.label}
              </PartsQuoteModalLink>
            ) : (
              <a key={item.label} href={item.href} className="inline-flex h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 leading-none no-underline transition hover:bg-[#dd3b3f] hover:!text-[#f7d95f]">
                <span className="leading-none">{item.label}</span>
                {item.hasMenu && <ChevronDown className="size-[11px] translate-y-px" />}
              </a>
            )
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-4 text-[14px] font-bold text-white max-xl:gap-3 max-xl:text-[13px] max-lg:w-full max-lg:justify-end max-lg:gap-5 max-sm:text-[13px]">
          <Link href="/help" className="inline-flex h-[34px] items-center gap-2 rounded-[7px] px-2 leading-none transition hover:bg-[#dd3b3f] hover:!text-[#f7d95f]">
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
            <Link href="/track-order" className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[11px] border border-[#f5b9bc] bg-white px-[16px] text-[14px] font-black leading-none !text-[#ef3338] shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-all duration-200 hover:scale-[1.04] hover:bg-[#fff2f2] hover:shadow-[0_16px_30px_rgba(220,38,38,0.28)] active:scale-[1.01] max-xl:px-3 max-sm:h-9 max-sm:px-4 max-sm:text-[12px]">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[#ef3338]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6M8 13h8M8 17h6" />
              </svg>
              <span className="leading-none !text-[#ef3338]">Track Order</span>
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
      <HeaderCategoryTreeClient />
    </>
  );
}

function SearchHeaderBar({ settings }) {
  return (
    <div className="mx-auto flex h-[82px] w-full max-w-[1720px] items-center gap-10 px-5 sm:px-8 lg:px-10 max-lg:h-auto max-lg:flex-wrap max-lg:gap-4 max-lg:py-3">
      <LogoMark logo={settings?.logo} />
      <TopSearch placeholderTexts={settings?.searchPlaceholders} />
      <div className="hidden shrink-0 items-center text-white lg:ml-auto lg:flex">
        <a href="tel:09617226688" className="block translate-x-4 rounded-[8px] px-1.5 py-1 leading-none text-white">
          <span className="flex items-center gap-1.5 text-[13px] font-medium tracking-[0.085em] text-white/82">
            <Icon name="clock" className="size-3.5 text-white/72" />
            <span>Call Us (10.00am-8.00pm)</span>
          </span>
          <span className="mt-1.5 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="header-phone-ring size-4 text-[#ef3338]" fill="currentColor" aria-hidden="true">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2a1.4 1.4 0 0 1 1.42-.34c1.56.52 3.18.78 4.83.78.74 0 1.34.6 1.34 1.34v3.48c0 .74-.6 1.34-1.34 1.34C10.8 21.78 2.22 13.2 2.22 2.34 2.22 1.6 2.82 1 3.56 1h3.5c.74 0 1.34.6 1.34 1.34 0 1.65.26 3.27.78 4.83.16.49.04 1.03-.34 1.42l-2.22 2.2Z" />
            </svg>
            <span className="text-[24px] font-black leading-none tracking-[0.02em] text-white">09617 22 66 88</span>
          </span>
        </a>
      </div>
      <span className="hidden h-8 w-px shrink-0 bg-[#111827] lg:block" />
      <div className="hidden items-center gap-6 text-white lg:flex">
        <HeaderWishlistButton />
        <HeaderCompareButton />
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
  const image3Slides = [
    {
      src: "/hero-image-3-slide-1.webp",
      alt: "Mobil 1 engine oil genuine product banner",
    },
    {
      src: "/hero-image-3-slide-2.webp",
      alt: "Yesido VC13 car jump starter banner",
    },
    {
      src: "/hero-image-3-slide-3.webp",
      alt: "Car cover protection service banner",
    },
  ];

  return (
    <section className="bg-[#f2f3f5] pt-0 pb-4">
      <div className="grid w-full max-w-none gap-3 bg-[#f2f3f5] md:grid-cols-[minmax(0,4fr)_minmax(220px,1fr)]">
        <section className="relative h-[220px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-[665px]" aria-label="Mobil online shopping banner">
          <img
            src="/hero-image-1-mobil-banner.webp"
            alt="Buy Mobil online with home delivery"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>
        <div className="grid h-[292px] gap-3 md:h-[665px] md:grid-rows-[1fr_2fr]">
          <section className="hero-zoom-panel relative h-[110px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-auto md:min-h-0" aria-label="Download app offer banner">
            <img
              src="/hero-image-2-app-banner.webp"
              alt="Download the app and get 250 off on your first order"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </section>
          <section className="manual-slide-shell hero-zoom-panel relative h-[170px] overflow-hidden rounded-[6px] border border-[#dfe4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] md:h-auto md:min-h-0" aria-label="Promotional banner slider">
            <div className="hero-image-3-track absolute inset-0">
              {[...image3Slides, image3Slides[0]].map((slide, index) => (
                <img
                  key={`${slide.src}-${index}`}
                  src={slide.src}
                  alt={index === image3Slides.length ? "" : slide.alt}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function HeroFeatureStrip() {
  const features = [
    {
      icon: "tag",
      title: "Competitive Price",
      text: "Get The Best Prices Everyday",
    },
    {
      icon: "award",
      title: "Authentic Products",
      text: "Secured with Brand Warranty",
    },
    {
      icon: "card",
      title: "Easy & Secured Payment",
      text: "Pre-payment, Cash on Delivery",
    },
    {
      icon: "truck",
      title: "Fast Delivery",
      text: "Rapid delivery At Your Doorstep",
    },
    {
      icon: "rotate",
      title: "7-Day Easy Returns",
      text: "Hassle-free returns and replacements with full warranty",
    },
    {
      icon: "headphones",
      title: "Expert Support Team",
      text: "Professional automotive specialists available 7 days a week",
    },
  ];

  return (
    <section className="bg-[#f2f3f5] py-3">
      <div className="mx-auto grid w-[calc(100%-40px)] max-w-none grid-cols-6 gap-3 sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)] max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group/feature relative flex min-h-[66px] items-center gap-3 overflow-hidden rounded-[10px] border border-white/85 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] px-4 py-2.5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.055)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ffd2d3] hover:shadow-[0_16px_30px_rgba(239,51,56,0.10)]"
          >
            <span className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,#ff3b40,transparent)] opacity-0 transition group-hover/feature:opacity-100" />
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#f7f7fa] text-[#ef3338] shadow-[inset_0_0_0_1px_#eceef3] transition group-hover/feature:bg-white group-hover/feature:shadow-[inset_0_0_0_1px_#ffd2d3,0_8px_18px_rgba(239,51,56,0.10)]">
              <Icon name={feature.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[16px] font-semibold leading-tight text-[#111827]">{feature.title}</span>
              <span className="mt-1 block text-[13px] font-medium leading-snug text-[#8a93a3]">{feature.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroCategorySlider() {
  return (
    <section className="bg-transparent pt-2 pb-3">
      <div className="w-full max-w-none">
        <div className="manual-slide-shell category-marquee relative overflow-hidden rounded-[10px] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
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
      </div>
    </section>
  );
}

function CategoryShowcase() {
  return (
    <section id="categories" className="bg-transparent pt-3 pb-4 max-sm:py-3">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          HANDPICKED CATAGORIES
        </div>
        <a
          href="/category"
          className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-[7px] bg-[#ef3338] px-4 text-[11px] font-black leading-none !text-white shadow-[0_7px_16px_rgba(239,51,56,0.22)] transition hover:bg-[#d3191d] hover:shadow-[0_10px_20px_rgba(239,51,56,0.18)]"
        >
          View all
        </a>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-7 lg:w-[calc(100%-80px)] lg:p-10">
        <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
          {categoryShowcase.map((group) => (
            <article key={group.title} className={`group/showcase relative overflow-hidden rounded-[8px] border p-6 shadow-[0_10px_24px_rgba(15,23,42,0.045)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:opacity-0 before:transition-opacity hover:-translate-y-0.5 hover:before:opacity-100 ${group.theme.card}`}>
              <div className="mb-[14px] flex items-center justify-between gap-3">
                <h2 className={`min-w-0 truncate text-[15px] font-black leading-5 transition ${group.theme.title}`}>{group.title}</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {group.items.map((item) => (
                  <a key={item.label} href={`#${slugify(item.label)}`} className="group/category block">
                    <div className={`relative h-[150px] overflow-hidden rounded-[7px] bg-[#f5f6f8] bg-[url('/japanparts-reference.png')] bg-[length:1920px_957px] bg-no-repeat shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)] ${item.crop} ${group.theme.itemStroke} transition duration-200 after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_45%,rgba(17,24,39,0.18)_100%)] after:opacity-0 after:transition group-hover/category:scale-[1.015] group-hover/category:shadow-[0_10px_22px_rgba(15,23,42,0.14)] group-hover/category:after:opacity-100 max-sm:h-[170px]`} />
                    <p className="mt-[7px] truncate text-[14px] font-semibold leading-5 text-[#4b5563] transition group-hover/category:text-[#ef3338]">{item.label}</p>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumAuthenticVideoSection() {
  return (
    <section className="bg-transparent py-5 max-sm:py-4">
      <div className="mx-auto w-[calc(100%-40px)] max-w-none sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="relative min-h-[430px] w-full overflow-hidden rounded-[12px] bg-[#050505] sm:min-h-[500px] lg:min-h-[560px]">
          <img
            src="/jpspare-hero-slide-1.gif"
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.18),rgba(0,0,0,0.74))]" />
          <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 mx-auto flex min-h-[430px] w-full max-w-none flex-col items-center justify-center px-4 py-16 text-center text-white sm:min-h-[500px] lg:min-h-[560px]">
            <h2 className="text-[34px] font-black uppercase leading-[1.05] tracking-[0.02em] text-white sm:text-[46px] lg:text-[64px]">
              100% Premium & Authentic
            </h2>
            <p className="mt-6 max-w-[650px] text-[15px] font-bold leading-7 text-white sm:text-[17px]">
              All our products are premium branded and 100% authentic. Whatever you buy it will work.
            </p>
            <Link
              href="/products"
              className="mt-10 inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-white px-8 text-[15px] font-bold leading-none !text-[#111827] shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition duration-200 hover:scale-[1.03] hover:bg-[#fff2f2] hover:shadow-[0_18px_38px_rgba(239,51,56,0.2)]"
            >
              Explore More
              <Icon name="arrow" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumBrandsSection() {
  return (
    <section id="brands" className="bg-transparent py-6 max-sm:py-4">
      <div className="mx-auto mb-3 flex min-h-[52px] w-[calc(100%-40px)] items-center justify-between gap-4 rounded-[6px] bg-white px-2 text-left sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
        <div className="text-[20px] font-semibold leading-none text-[#111827] max-sm:text-[16px]">
          PREMIUM PARTNERS
        </div>
      </div>
      <div className="mx-auto w-[calc(100%-40px)] max-w-none rounded-[12px] bg-white p-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[calc(100%-64px)] sm:p-6 lg:w-[calc(100%-80px)] lg:p-8">
        <div className="manual-slide-shell brand-marquee pb-5 pt-3 text-left" data-loop-copies="4">
          <SlideManualControls step={4} />
          <div className="brand-marquee-track flex w-max gap-8 max-sm:gap-4">
          {[...premiumBrands, ...premiumBrands, ...premiumBrands, ...premiumBrands].map((brand, index) => (
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

      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f2f3f5] text-[#111827]">
      <CompareHashRedirect />
      <TopDealBar />
      <Header />
      <Hero />
      <HeroFeatureStrip />
      <CategoryShowcase />
      <LatestJapaneseAutoParts />
      <HeroCategorySlider />
      <section className="bg-transparent py-4">
        <div className="mx-auto w-[calc(100%-40px)] max-w-none sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)]">
          <FeaturedOfferBanners />
        </div>
      </section>
      <ProductTabs />
      <PremiumAuthenticVideoSection />
      <BestSellingAutoParts />
      <PremiumBrandsSection />
      <CustomerReviews />
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
