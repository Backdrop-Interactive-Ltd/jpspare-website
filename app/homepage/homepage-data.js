export const navItems = [
  { label: "HOME", href: "/" },
  { label: "CAR ACCESSORIES", href: "/collections/car-accessories", hasMenu: true },
  { label: "CAR PARTS", href: "/collections/car-parts", hasMenu: true },
  { label: "TYRES", href: "/collections/tyres", hasMenu: true },
  { label: "LUBRICANT", href: "/collections/lubricant", hasMenu: true },
  { label: "BRANDS", href: "/brands" },
  { label: "MODIFICATION", href: "/modification" },
  { label: "OFFERS", href: "/offers" },
  { label: "COMBO PACKAGE", href: "/combo-package" },
  { label: "PARTS QUOTE", href: "/parts-quote" },
];

export const carAccessorySubcategories = [
  { title: "Interior", icon: "car", tone: "red", links: ["Air Freshener", "Seat Covers", "Floor Mats"] },
  { title: "Exterior", icon: "body", tone: "blue", links: ["Car Cover", "Mud Guard", "Chrome Trim"] },
  { title: "Electronics", icon: "bolt", tone: "indigo", links: ["Phone Holder", "Dash Camera", "Chargers", "Reverse Camera", "GPS Tracker", "Parking Sensor", "Car DVR", "Bluetooth Adapter"] },
  { title: "Car Care", icon: "drop", tone: "teal", links: ["Wax", "Shampoo", "Washer Fluid"] },
  { title: "Utility", icon: "package", tone: "amber", links: ["Organizer", "Tool Kit", "Storage"] },
  { title: "Safety", icon: "check", tone: "green", links: ["Emergency Kit", "Reflector", "First Aid"] },
  { title: "Performance", icon: "trend", tone: "orange", links: ["Cleaner", "Additive", "Filter Care"] },
  { title: "Lifestyle", icon: "star", tone: "purple", links: ["Perfume", "Decor", "Travel"] },
];

export const recommendedAccessories = [
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

export const recommendedCarParts = [
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

export const recommendedTyres = [
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

export const recommendedLubricants = [
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

export const vehicleBrands = ["Toyota", "Honda", "Nissan", "Mitsubishi", "Suzuki"];

export const carPartCategories = [
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

export const tyreBrands = [
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

export const rimSizes = ["13 INCH", "14 INCH", "15 INCH", "16 INCH", "17 INCH", "18 INCH", "19 INCH", "20 INCH", "21 INCH", "22 INCH"];

export const lubricantCategories = [
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

export const lubricantBrands = ["ELF", "Shell", "Mobil 1", "Liqui Moly", "Ravenol", "Totachi", "Idemitsu", "OTHER BRANDS"];

export const menuCategorySlugs = ["car-accessories", "car-parts", "tyres", "lubricant"];
export const fallbackMenuCategories = [
  { name: "Car Accessories", slug: "car-accessories", children: carAccessorySubcategories },
  { name: "Car Parts", slug: "car-parts", children: carPartCategories },
  { name: "Tyres", slug: "tyres", children: [] },
  { name: "Lubricant", slug: "lubricant", children: lubricantCategories },
];
export const categoryIconCycle = ["disc", "bolt", "car", "filter", "drop", "package", "battery", "gear"];
export const categoryToneCycle = ["red", "orange", "blue", "green", "teal", "purple", "amber", "indigo"];

export const premiumBrands = [
  { name: "DENSO", short: "DENSO", color: "bg-[#ed1f24] text-white" },
  { name: "Shell", short: "SH", color: "bg-white text-[#d71920] border border-[#f7d95f]" },
  { name: "Mobil 1", short: "Mobil 1", color: "bg-white text-[#1f315f]" },
  { name: "Brembo", short: "brembo", color: "bg-[#e12526] text-white" },
  { name: "Bridgestone", short: "MICHELIN", color: "bg-white text-[#1453a6]" },
  { name: "AKEBONO", short: "AKEBONO", color: "bg-white text-[#2270a8]" },
  { name: "Advics", short: "ADVICS", color: "bg-white text-[#24436b]" },
  { name: "Bizol", short: "BI", color: "bg-white text-[#d71920] border border-[#f7d95f]" },
];

export const categoryShowcase = [
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

export const heroCategorySlider = [
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
