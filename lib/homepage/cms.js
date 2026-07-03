import { prisma } from "../db";

export const HOMEPAGE_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR", "PRODUCT_MANAGER"];
export const HOMEPAGE_MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"];

export const homepageSettingKeys = {
  announcement: "homepage.announcement",
  header: "homepage.header",
  navigation: "homepage.navigation",
  seo: "homepage.seo",
  footer: "homepage.footer",
  sitePages: "homepage.site-pages",
};

export const homepageSectionKeys = {
  heroSlider: "homepage.hero-slider",
  featuredCategories: "homepage.featured-categories",
  featuredProducts: "homepage.featured-products",
  promoBanners: "homepage.promo-banners",
  brandShowcase: "homepage.brand-showcase",
};

export const defaultHomepageCms = {
  announcement: {
    enabled: true,
    text: "Today deal sale off 80%. End in",
    secondaryText: "Shop over 7000 Tk get free delivery",
    buttonText: "Hurry Up →",
    buttonLink: "/offers",
    rotationIntervalMs: 10450,
  },
  header: {
    logo: "/jpspare-logo-wide-clean.png",
    contactNumber: "01718914582",
    searchPlaceholders: [
      "Search for authentic parts...",
      "Search for accessories...",
      "Search for lubricant...",
      "Search for tyres...",
      "Search for rims...",
      "Search for car care products...",
      "Search for suspension parts...",
      "Search for brake pads...",
      "Search for engine oil...",
      "Search for detailing products...",
    ],
    stickySearchHeader: true,
    stickyCategoryHeader: false,
  },
  navigation: {
    main: [
      { label: "HOME", href: "/", enabled: true, sortOrder: 10, hasMenu: false },
      { label: "CAR ACCESSORIES", href: "/collections/car-accessories", enabled: true, sortOrder: 20, hasMenu: true },
      { label: "CAR PARTS", href: "/collections/car-parts", enabled: true, sortOrder: 30, hasMenu: true },
      { label: "TYRES", href: "/collections/tyres", enabled: true, sortOrder: 40, hasMenu: true },
      { label: "LUBRICANT", href: "/collections/lubricant", enabled: true, sortOrder: 50, hasMenu: true },
      { label: "BRANDS", href: "/brands", enabled: true, sortOrder: 60, hasMenu: false },
      { label: "MODIFICATION", href: "/modification", enabled: true, sortOrder: 70, hasMenu: false },
      { label: "OFFERS", href: "/offers", enabled: true, sortOrder: 80, hasMenu: false },
      { label: "COMBO PACKAGE", href: "/combo-package", enabled: true, sortOrder: 90, hasMenu: false },
      { label: "PARTS QUOTE", href: "/parts-quote", enabled: true, sortOrder: 100, hasMenu: false },
    ],
    megaMenu: {
      enabled: true,
      promoCard: {
        enabled: true,
        eyebrow: "Premium",
        title: "Brake Parts",
        subtitle: "Safety. Performance. Reliability.",
        buttonText: "Shop Now",
        buttonLink: "/products?q=brake",
        image: "",
      },
      helpBar: {
        enabled: true,
        title: "Need Help Finding the Right Part?",
        subtitle: "Our experts are ready to help you find the perfect fit.",
        callLabel: "Call Us Now",
        phone: "09617 22 66 88",
        callNumber: "09617 22 66 88",
        chatLabel: "Chat with Expert",
        chatLink: "/help",
        chatText: "We're Online",
      },
      featureCards: [
        { icon: "tag", title: "15% Offer", subtitle: "On selected brake parts", enabled: true, sortOrder: 10 },
        { icon: "shield", title: "100% Authentic", subtitle: "Genuine & Trusted", enabled: true, sortOrder: 20 },
        { icon: "truck", title: "Fast Shipping", subtitle: "Across Bangladesh", enabled: true, sortOrder: 30 },
        { icon: "refresh", title: "Easy Returns", subtitle: "7 Days Return Policy", enabled: true, sortOrder: 40 },
      ],
      featuredBrands: [
        { label: "brembo", href: "/products?brand=brembo", logo: "", enabled: true, sortOrder: 10 },
        { label: "DENSO", href: "/products?brand=denso", logo: "", enabled: true, sortOrder: 20 },
        { label: "akebono", href: "/products?brand=akebono", logo: "", enabled: true, sortOrder: 30 },
        { label: "ADVICS", href: "/products?brand=advics", logo: "", enabled: true, sortOrder: 40 },
        { label: "NGK", href: "/products?brand=ngk", logo: "", enabled: true, sortOrder: 50 },
        { label: "JAPANPARTS", href: "/products?brand=japanparts", logo: "", enabled: true, sortOrder: 60 },
      ],
      categoryRail: [
        { key: "accessories", label: "Accessories", icon: "package", enabled: true, sortOrder: 10 },
        { key: "car-parts", label: "Car Parts", icon: "gear", enabled: true, sortOrder: 20 },
        { key: "tyres", label: "Tyres", icon: "car", enabled: true, sortOrder: 30 },
        { key: "lubricants", label: "Lubricants", icon: "drop", enabled: true, sortOrder: 40 },
      ],
    },
  },
  heroSlider: {
    enabled: true,
    slides: [
      {
        id: "hero-pirelli",
        desktopImage: "/jpspare-hero-slide-1.gif",
        mobileImage: "/jpspare-hero-slide-1.gif",
        alt: "Pirelli podium cap special edition banner",
        heading: "From the Track to the Streets",
        subheading: "Discover the Pirelli Podium Cap Special Editions.",
        ctaText: "Buy Now",
        ctaLink: "/tyres",
        active: true,
      },
      {
        id: "hero-mobil-online",
        desktopImage: "/jpspare-hero-slide-2.webp",
        mobileImage: "/jpspare-hero-slide-2.webp",
        alt: "Mobil online shopping delivery banner",
        heading: "Mobil Delivered Nationwide",
        subheading: "Order premium engine oil and car care products online.",
        ctaText: "Shop Lubricants",
        ctaLink: "/lubricant",
        active: true,
      },
      {
        id: "hero-mobil-1",
        desktopImage: "/jpspare-hero-slide-3.jpg",
        mobileImage: "/jpspare-hero-slide-3.jpg",
        alt: "Mobil 1 synthetic motor oil brand banner",
        heading: "World Leading Synthetic Motor Oil",
        subheading: "Premium lubricant solutions for modern engines.",
        ctaText: "Explore Mobil",
        ctaLink: "/brands",
        active: true,
      },
    ],
  },
  featuredCategories: {
    enabled: true,
    categoryIds: [],
  },
  featuredProducts: {
    enabled: true,
    productIds: [],
    featuredOnly: true,
    limit: 20,
  },
  promoBanners: {
    enabled: true,
    banners: [],
  },
  brandShowcase: {
    enabled: true,
    brandIds: [],
    autoSlider: true,
  },
  seo: {
    metaTitle: "JPSPARE | Premium Auto Parts & Accessories",
    metaDescription: "Authentic Japanese automotive parts, accessories, tyres, lubricant, and car care products.",
    keywords: "JPSPARE, auto parts, car accessories, tyres, lubricant, Japanese parts",
    ogImage: "/jpspare-logo-wide-clean.png",
  },
  footer: {
    logo: "/jpspare-logo-wide-clean.png",
    footerLogo: "/jpspare-logo.png",
    bottomImage: "/footer-ssl-payment.jpg",
    about: "Building Bangladesh's most trusted online marketplace for genuine car parts, premium automotive accessories, and automotive lifestyle products—delivering authenticity, competitive prices, and a seamless shopping experience.",
    aboutText: "Building Bangladesh's most trusted online marketplace for genuine car parts, premium automotive accessories, and automotive lifestyle products—delivering authenticity, competitive prices, and a seamless shopping experience.",
    copyright: "© 2026 JPSPARE. All rights reserved. | Developed by Backdrop Interactive",
    copyrightText: "© 2026 JPSPARE. All rights reserved. | Developed by Backdrop Interactive",
    contacts: {
      phone: "01718914582",
      secondaryPhone: "09617226688",
      email: "info@jpspare.com.bd",
      address: "167/3/c/3, Mollapara, Taltola, Sher-E-Bangla Nagor, Dhaka-1207",
    },
    contact: {
      phone: "01718914582",
      secondaryPhone: "09617226688",
      email: "info@jpspare.com.bd",
      address: "167/3/c/3, Mollapara, Taltola, Sher-E-Bangla Nagor, Dhaka-1207",
    },
    socials: {
      facebook: "#social",
      instagram: "#social",
      youtube: "#social",
      tiktok: "#social",
    },
    socialLinks: {
      facebook: "#social",
      instagram: "#social",
      youtube: "#social",
    },
    quickLinks: [
      { label: "All Collections", href: "/collection", enabled: true, sortOrder: 10 },
      { label: "Browse Products", href: "/products", enabled: true, sortOrder: 20 },
      { label: "Deals & Offers", href: "/offers", enabled: true, sortOrder: 30 },
    ],
    customerLinks: [
      { label: "Track Your Order", href: "/track-order", enabled: true, sortOrder: 10 },
      { label: "Vehicle Fitment", href: "/products/hitachi-shock-absorver-b3337#compatibility", enabled: true, sortOrder: 20 },
      { label: "Parts Quote", href: "/parts-quote", enabled: true, sortOrder: 30 },
      { label: "Help Center", href: "/help", enabled: true, sortOrder: 40 },
      { label: "Returns & Warranty", href: "/returns-warranty", enabled: true, sortOrder: 50 },
      { label: "Privacy Policy", href: "/privacy-policy", enabled: true, sortOrder: 60 },
    ],
    accountLinks: [
      { label: "Sign In", href: "/signin", enabled: true, sortOrder: 10 },
      { label: "Create Account", href: "/create-account", enabled: true, sortOrder: 20 },
      { label: "My Account", href: "/dashboard", enabled: true, sortOrder: 30 },
      { label: "Wishlist", href: "/wishlisht", enabled: true, sortOrder: 40 },
      { label: "Shopping Cart", href: "/cart", enabled: true, sortOrder: 50 },
    ],
    companyLinks: [
      { label: "About JPSPARE", href: "/about", enabled: true, sortOrder: 10 },
      { label: "Blog & News", href: "/blog", enabled: true, sortOrder: 20 },
      { label: "Video Gallery", href: "/video-gallery", enabled: true, sortOrder: 30 },
      { label: "Contact Us", href: "/help", enabled: true, sortOrder: 40 },
    ],
    paymentIcons: [
      { label: "SSLCommerz", image: "/footer-ssl-payment.jpg", href: "#payment", enabled: true, sortOrder: 10 },
    ],
    appBadges: {
      appStoreImage: "/footer-app-store-badge.png",
      appStoreHref: "#app",
      googlePlayImage: "/footer-google-play-badge.png",
      googlePlayHref: "#app",
    },
    trustBadges: [
      { label: "3000+ Accessories", icon: "check", enabled: true, sortOrder: 10 },
      { label: "98% Satisfaction", icon: "check", enabled: true, sortOrder: 20 },
      { label: "24/7 Support", icon: "check", enabled: true, sortOrder: 30 },
    ],
  },
  sitePages: {
    about: {
      enabled: true,
      seo: {
        metaTitle: "About JPSPARE | Authentic Japanese Automotive Parts",
        metaDescription: "Learn about JPSPARE, our quality promise, values, and commitment to authentic Japanese automotive parts in Bangladesh.",
      },
      hero: {
        eyebrow: "Authentic Automotive Since 2018",
        title: "Authentic Japanese Parts, Built for Confident Driving",
        highlightedText: "Japanese",
        description:
          "JPSPARE helps drivers, workshops, and auto enthusiasts source reliable Japanese automotive parts and accessories with clear guidance, fair value, and dependable support.",
        primaryCtaText: "Explore Parts",
        primaryCtaLink: "/car-parts",
        secondaryCtaText: "Contact Support",
        secondaryCtaLink: "/help",
        image: "/products-reference.png",
        imageAlt: "JPSPARE product catalogue",
        imageTitle: "JPSPARE Excellence",
        imageSubtitle: "Verified products, practical support, and fast sourcing.",
      },
      stats: [
        { value: "2018", label: "Serving Since", enabled: true, sortOrder: 10 },
        { value: "50k+", label: "Monthly Readers", enabled: true, sortOrder: 20 },
        { value: "13+", label: "Expert Articles", enabled: true, sortOrder: 30 },
        { value: "24/7", label: "Support", enabled: true, sortOrder: 40 },
      ],
      story: {
        eyebrow: "Our Story",
        title: "Born from Passion for Japanese Engineering",
        highlightedText: "Japanese Engineering",
        paragraphs: [
          "JPSPARE operates under Authentic Automotive Ltd. with a simple mission: make genuine, high-quality Japanese automotive parts easier to find and easier to trust.",
          "From engine care and brake components to accessories, tyres, lighting, batteries, and car-care products, we focus on verified sourcing and practical support.",
          "Our team works with customers before and after purchase so every order feels clearer, faster, and more dependable.",
        ],
        milestones: [
          { number: "01", title: "Founded With Purpose", body: "Built to make verified Japanese automotive parts easier to source in Bangladesh.", enabled: true, sortOrder: 10 },
          { number: "02", title: "Quality First", body: "Every product is selected with authenticity, fitment, and long-term reliability in mind.", enabled: true, sortOrder: 20 },
          { number: "03", title: "Customer Guidance", body: "Our support team helps drivers and workshops find the right part before ordering.", enabled: true, sortOrder: 30 },
        ],
        missionTitle: "Our Mission",
        missionBody: "To make premium Japanese-brand spare parts accessible, fairly priced, and backed by support customers can rely on.",
      },
      imageBlocks: [
        {
          eyebrow: "JPSPARE In Action",
          title: "A Practical Parts Experience",
          description: "Our digital catalogue, product images, and support team work together so customers can compare, choose, and order with more confidence.",
          image: "/products-reference.png",
          imageAlt: "JPSPARE product selection",
          badges: ["Dhaka", "Genuine", "Fast"],
          enabled: true,
          sortOrder: 10,
        },
      ],
      values: [
        { title: "Authenticity", body: "Products are sourced from trusted manufacturers and verified before reaching customers.", icon: "shield", enabled: true, sortOrder: 10 },
        { title: "Nationwide Reach", body: "Online ordering and support help customers source parts across Bangladesh.", icon: "globe", enabled: true, sortOrder: 20 },
        { title: "Expert Support", body: "Our team guides customers with part matching, fitment details, and practical advice.", icon: "support", enabled: true, sortOrder: 30 },
        { title: "Better Value", body: "We reduce sourcing friction while maintaining quality and service standards.", icon: "star", enabled: true, sortOrder: 40 },
      ],
      cta: {
        enabled: true,
        eyebrow: "Our Values",
        title: "Built on Strong Foundations",
        highlightedText: "Strong Foundations",
        description: "The JPSPARE experience is designed around trust, speed, clarity, and reliable automotive support.",
      },
    },
    privacyPolicy: {
      enabled: true,
      seo: {
        metaTitle: "Privacy Policy | JPSPARE",
        metaDescription: "JPSPARE privacy policy covering data collection, security, cookies, and customer rights.",
      },
      hero: {
        backLabel: "Back to Home",
        backLink: "/",
        eyebrow: "Privacy Center",
        title: "Privacy Policy",
        highlightedText: "Policy",
        description:
          "JPSPARE is committed to protecting your privacy and personal information. This policy explains how we collect, use, and safeguard your data.",
      },
      stats: [
        { value: "SSL", label: "Encryption", enabled: true, sortOrder: 10 },
        { value: "Safe", label: "Payments", enabled: true, sortOrder: 20 },
        { value: "No", label: "Data Sales", enabled: true, sortOrder: 30 },
        { value: "May 2026", label: "Updated", enabled: true, sortOrder: 40 },
      ],
      principles: {
        title: "Your Privacy Matters",
        description: "We keep customer data handling clear, purposeful, and service-focused.",
        listTitle: "Data Principles",
        items: [
          { label: "Collect only useful service data", enabled: true, sortOrder: 10 },
          { label: "Protect order and account details", enabled: true, sortOrder: 20 },
          { label: "Use trusted payment providers", enabled: true, sortOrder: 30 },
          { label: "Support privacy requests", enabled: true, sortOrder: 40 },
        ],
      },
      contact: {
        eyebrow: "Privacy Contact",
        email: "privacy@jpspare.com.bd",
        phone: "01718914582",
      },
      policyCards: [
        {
          title: "Information We Collect",
          body: "We collect information you provide directly when you create an account, make a purchase, submit an inquiry, or contact support.",
          bullets: ["Name, email, phone, and address", "Order history and vehicle fitment details", "Search activity and basic analytics"],
          enabled: true,
          sortOrder: 10,
        },
        {
          title: "How We Use Information",
          body: "We use collected data to provide, maintain, and improve the automotive parts shopping experience.",
          bullets: ["Process orders and delivery", "Provide support and fitment assistance", "Send account and shipment notices"],
          enabled: true,
          sortOrder: 20,
        },
        {
          title: "Information Sharing",
          body: "We do not sell or trade your personal information. Sharing happens only when needed to operate services or comply with law.",
          bullets: ["Trusted service providers", "Legal compliance", "Business transfer if applicable"],
          enabled: true,
          sortOrder: 30,
        },
        {
          title: "Data Security",
          body: "We apply practical security measures to protect information from unauthorized access, alteration, disclosure, or destruction.",
          bullets: ["SSL encrypted transmission", "Trusted payment providers", "Access control practices"],
          enabled: true,
          sortOrder: 40,
        },
        {
          title: "Cookies & Tracking",
          body: "Cookies and similar tools help improve browsing, remember preferences, analyze website traffic, and improve product discovery.",
          bullets: ["Preference remembering", "Traffic analytics", "Product discovery improvement"],
          enabled: true,
          sortOrder: 50,
        },
        {
          title: "Your Rights",
          body: "You can manage how your personal information is used by JPSPARE by contacting our support team.",
          bullets: ["Update personal information", "Request eligible data deletion", "Opt out of marketing messages"],
          enabled: true,
          sortOrder: 60,
        },
      ],
      cta: {
        enabled: true,
        eyebrow: "Transparency",
        title: "Questions about your data?",
        description: "Reach out to our privacy team for access, update, deletion, or marketing opt-out requests.",
        buttonText: "Contact Support",
        buttonLink: "/help",
      },
    },
    returnsWarranty: {
      enabled: true,
      seo: {
        metaTitle: "Returns & Warranty | JPSPARE",
        metaDescription: "JPSPARE returns, warranty, shipping, inspection, and support policy.",
      },
      hero: {
        backLabel: "Back to Home",
        backLink: "/",
        eyebrow: "Policy Center",
        title: "Returns & Warranty",
        highlightedText: "Warranty",
        description: "Clear return, inspection, and warranty guidelines for JPSPARE products. Please review these terms before making a claim.",
      },
      stats: [
        { value: "7", label: "Day Window", enabled: true, sortOrder: 10 },
        { value: "OEM", label: "Warranty", enabled: true, sortOrder: 20 },
        { value: "24/7", label: "Support", enabled: true, sortOrder: 30 },
        { value: "May 2026", label: "Updated", enabled: true, sortOrder: 40 },
      ],
      notice: {
        title: "Important Notice",
        description: "By purchasing from JPSPARE, you agree to our return, warranty, inspection, and support policies.",
      },
      returnPolicies: [
        {
          title: "Return Eligibility",
          description: "Products may be eligible for return when they are unused, unopened, and returned with original packaging, invoice, and all included accessories.",
          bullets: ["Return request within 7 days", "Original invoice required", "Product must be resaleable"],
          enabled: true,
          sortOrder: 10,
        },
        {
          title: "Inspection Process",
          description: "All return and warranty claims are reviewed by our support team before approval.",
          bullets: ["Photos may be requested", "Installation details may be checked", "Physical inspection may apply"],
          enabled: true,
          sortOrder: 20,
        },
        {
          title: "Replacement & Refunds",
          description: "Approved claims may be resolved through replacement, store credit, or refund depending on stock availability and claim type.",
          bullets: ["Stock availability based", "Claim type reviewed", "Timeline may vary"],
          enabled: true,
          sortOrder: 30,
        },
        {
          title: "Shipping for Returns",
          description: "Customers should safely pack return items. For verified product fault or wrong shipment, JPSPARE will assist according to the approved claim.",
          bullets: ["Secure packaging required", "Return logistics reviewed", "Fault verification applies"],
          enabled: true,
          sortOrder: 40,
        },
        {
          title: "Non-Returnable Items",
          description: "Installed parts, damaged packaging, used fluids, opened lubricants, custom orders, discounted clearance items, and improper installation damage are not returnable.",
          bullets: ["Installed parts excluded", "Opened fluids excluded", "Custom orders excluded"],
          enabled: true,
          sortOrder: 50,
        },
      ],
      warrantyPolicies: [
        {
          title: "Warranty Coverage",
          description: "Warranty coverage applies only to eligible products with manufacturer or supplier warranty support.",
          bullets: ["Category-based terms", "Brand-specific coverage", "Inspection result required"],
          enabled: true,
          sortOrder: 10,
        },
      ],
      claimChecklist: [
        { label: "Order number", enabled: true, sortOrder: 10 },
        { label: "Product details", enabled: true, sortOrder: 20 },
        { label: "Clear photos or videos", enabled: true, sortOrder: 30 },
        { label: "Installation details if applicable", enabled: true, sortOrder: 40 },
      ],
      supportContact: {
        eyebrow: "JPSPARE Support",
        heading: "Need Help With A Claim?",
        description: "Our support team will guide you through inspection, replacement, or warranty support.",
        phone: "01718914582",
        email: "info@jpspare.com.bd",
        buttonText: "Contact Support",
        buttonLink: "/help",
      },
      cta: {
        enabled: true,
        eyebrow: "Need Help With A Claim?",
        title: "Contact us with your order number and product details.",
        description: "Our support team will guide you through inspection, replacement, or warranty support.",
        buttonText: "Contact Support",
        buttonLink: "/help",
      },
    },
    help: {
      enabled: true,
      seo: {
        metaTitle: "Help Center | JPSPARE",
        metaDescription: "Get support, request a part quote, and find JPSPARE contact information.",
      },
      hero: {
        eyebrow: "24/7 Customer Support Available",
        title: "Get In Touch",
        highlightedText: "Touch",
        description:
          "Need help finding the perfect part? Our automotive experts are here to assist you with genuine Japanese auto parts and professional guidance.",
        phone: "01718914582",
        email: "info@jpspare.com.bd",
        hours: "Sat-Thu 10PM-8PM, Fri 10PM-8PM",
      },
      intro: {
        title: "Multiple Ways to Reach Us",
        highlightedText: "Reach Us",
        description: "Choose the most convenient way to get in touch with our automotive parts experts. We are committed to providing exceptional service and support.",
      },
      contactCards: [
        {
          title: "Phone Support",
          detail: "01718914582",
          sub: "+8801905400772",
          note: "Call us for immediate assistance",
          icon: "phone",
          tone: "green",
          enabled: true,
          sortOrder: 10,
        },
        {
          title: "Email Support",
          detail: "info@jpspare.com.bd",
          sub: "support@jpspare.com.bd",
          note: "Send us your detailed inquiries",
          icon: "mail",
          tone: "blue",
          enabled: true,
          sortOrder: 20,
        },
        {
          title: "Visit Our Store",
          detail: "277 Tejgaon Industrial Area, Dhaka",
          sub: "Multiple locations available",
          note: "Come see our parts collection",
          icon: "pin",
          tone: "purple",
          enabled: true,
          sortOrder: 30,
        },
        {
          title: "Live Chat",
          detail: "Available Now",
          sub: "24/7 Online Support",
          note: "Get instant help online",
          icon: "headphones",
          tone: "orange",
          enabled: true,
          sortOrder: 40,
        },
      ],
      businessHours: {
        title: "Business Hours",
        items: [
          { label: "Saturday - Thursday", value: "10:00 AM - 8:00 PM", enabled: true, sortOrder: 10 },
          { label: "Friday", value: "10:00 AM - 8:00 PM", enabled: true, sortOrder: 20 },
          { label: "Emergency Support", value: "24/7 Available", enabled: true, sortOrder: 30 },
        ],
        note: "Emergency parts support available 24/7 for urgent automotive needs. Contact us anytime for critical breakdowns.",
      },
      emergencySupport: {
        enabled: true,
        title: "Emergency Support",
        description: "Need immediate assistance? Our 24/7 emergency support is available for critical automotive breakdowns and urgent part requirements.",
        phone: "01718914582",
        availability: "Available 24/7",
        buttonText: "Emergency Call",
        buttonLink: "tel:01718914582",
      },
      supportBenefits: [
        {
          title: "Genuine Japanese Parts",
          description: "Authentic OEM and aftermarket parts from trusted Japanese manufacturers",
          enabled: true,
          sortOrder: 10,
        },
        {
          title: "Expert Technical Support",
          description: "Our team has years of experience with Japanese automotive systems",
          enabled: true,
          sortOrder: 20,
        },
        {
          title: "Fast Nationwide Delivery",
          description: "Quick shipping across Bangladesh with secure packaging",
          enabled: true,
          sortOrder: 30,
        },
        {
          title: "Quality Guarantee",
          description: "All parts come with warranty and quality assurance",
          enabled: true,
          sortOrder: 40,
        },
      ],
      helpTopics: [
        { title: "Find the right part", description: "Share your vehicle details and our team will guide you.", icon: "check", enabled: true, sortOrder: 10 },
        { title: "Track an order", description: "Get support with shipment and delivery updates.", icon: "check", enabled: true, sortOrder: 20 },
        { title: "Request warranty help", description: "Submit order and product details for claim assistance.", icon: "check", enabled: true, sortOrder: 30 },
      ],
      cta: {
        enabled: true,
        title: "Why Choose Us?",
        description: "Need expert advice? Our support team will help you choose the right part before you order.",
        buttonText: "Contact Support",
        buttonLink: "/help",
      },
    },
    terms: {
      enabled: true,
      seo: {
        title: "Terms & Conditions | JPSPARE",
        description: "Read JPSPARE terms and conditions for orders, payments, products, customer responsibilities, and service usage.",
        metaTitle: "Terms & Conditions | JPSPARE",
        metaDescription: "Read JPSPARE terms and conditions for orders, payments, products, customer responsibilities, and service usage.",
      },
      hero: {
        title: "Terms & Conditions",
        subtitle: "Customer Agreement",
        eyebrow: "Customer Agreement",
        description: "Please review the terms that apply when browsing, ordering, and using JPSPARE services.",
      },
      sections: [
        {
          title: "Order Policy",
          description: "Orders are confirmed based on product availability, customer details, and successful order submission through JPSPARE channels.",
          bullets: ["Order confirmation may depend on stock availability", "Accurate customer and vehicle information is required", "JPSPARE may contact customers before processing"],
          enabled: true,
          sortOrder: 10,
        },
        {
          title: "Payment Policy",
          description: "Payments must be completed through approved JPSPARE payment methods before applicable orders are processed or dispatched.",
          bullets: ["Online payment and cash-on-delivery availability may vary", "Payment verification may be required", "Failed or incomplete payments may delay order processing"],
          enabled: true,
          sortOrder: 20,
        },
        {
          title: "Product Information",
          description: "Product details, images, specifications, compatibility notes, and availability are provided to help customers make informed decisions.",
          bullets: ["Images may be representative", "Fitment should be confirmed before purchase", "Prices and availability may change without prior notice"],
          enabled: true,
          sortOrder: 30,
        },
        {
          title: "Customer Responsibility",
          description: "Customers are responsible for providing accurate order, delivery, and vehicle information before confirming a purchase.",
          bullets: ["Check product compatibility before ordering", "Provide reachable contact information", "Inspect delivered products before installation"],
          enabled: true,
          sortOrder: 40,
        },
        {
          title: "Limitation of Liability",
          description: "JPSPARE is not responsible for damage caused by incorrect installation, misuse, unauthorized modification, or incompatible product selection.",
          bullets: ["Professional installation is recommended", "Used or installed items may have limited claim eligibility", "Liability is limited to applicable order value where permitted"],
          enabled: true,
          sortOrder: 50,
        },
        {
          title: "Changes to Terms",
          description: "JPSPARE may update these terms to reflect operational, legal, payment, or service changes.",
          bullets: ["Updated terms may be published on the website", "Continued use means acceptance of updated terms", "Customers may contact support for clarification"],
          enabled: true,
          sortOrder: 60,
        },
      ],
      cta: {
        heading: "Need help understanding these terms?",
        title: "Need help understanding these terms?",
        description: "Contact JPSPARE support if you have questions before placing an order.",
        buttonText: "Contact Support",
        buttonLink: "/help",
      },
    },
    shipping: {
      enabled: true,
      seo: {
        title: "Shipping Policy | JPSPARE",
        description: "Learn about JPSPARE delivery coverage, timelines, delivery charges, free delivery, failed delivery, and courier partners.",
        metaTitle: "Shipping Policy | JPSPARE",
        metaDescription: "Learn about JPSPARE delivery coverage, timelines, delivery charges, free delivery, failed delivery, and courier partners.",
      },
      hero: {
        title: "Shipping Policy",
        subtitle: "Delivery Information",
        eyebrow: "Delivery Information",
        description: "Review how JPSPARE handles delivery coverage, timelines, charges, and courier support across Bangladesh.",
      },
      sections: [
        {
          title: "Delivery Coverage",
          description: "JPSPARE delivers eligible products across Bangladesh through available courier and delivery partners.",
          bullets: ["Coverage may vary by location", "Some oversized or restricted items may need special handling", "Delivery availability is confirmed during order processing"],
          enabled: true,
          sortOrder: 10,
        },
        {
          title: "Delivery Timeline",
          description: "Estimated delivery timelines depend on customer location, product availability, payment status, and courier operations.",
          bullets: ["Dhaka delivery is usually faster than outside-Dhaka delivery", "Remote locations may require additional time", "Delays can occur due to holidays, weather, or courier issues"],
          enabled: true,
          sortOrder: 20,
        },
        {
          title: "Delivery Charge",
          description: "Delivery fees may vary based on destination, product size, package weight, courier service, and promotional eligibility.",
          bullets: ["Charges are shown or confirmed before dispatch", "Large or heavy items may require adjusted charges", "Cash-on-delivery fees may vary if applicable"],
          enabled: true,
          sortOrder: 30,
        },
        {
          title: "Free Delivery",
          description: "Free delivery may be available for selected campaigns, order values, locations, or products when announced by JPSPARE.",
          bullets: ["Free delivery eligibility may change by campaign", "Some products or locations may be excluded", "Promotional conditions must be met at checkout"],
          enabled: true,
          sortOrder: 40,
        },
        {
          title: "Failed Delivery",
          description: "A delivery may fail if the customer is unreachable, the address is incorrect, payment is not ready, or the parcel is refused.",
          bullets: ["Re-delivery may require additional charges", "Orders may be cancelled after repeated failed attempts", "Customers should keep contact numbers active"],
          enabled: true,
          sortOrder: 50,
        },
        {
          title: "Courier Partners",
          description: "JPSPARE works with trusted courier and delivery partners to handle product dispatch and customer deliveries.",
          bullets: ["Courier partner may vary by location", "Tracking details are shared when available", "Support can help with delivery follow-up"],
          enabled: true,
          sortOrder: 60,
        },
      ],
      cta: {
        heading: "Need delivery support?",
        title: "Need delivery support?",
        description: "Contact JPSPARE support with your order number for delivery updates or shipping questions.",
        buttonText: "Contact Support",
        buttonLink: "/help",
      },
    },
    faq: {
      enabled: true,
      seo: {
        title: "FAQ | JPSPARE",
        description: "Find answers to common JPSPARE questions about orders, delivery, genuine products, payments, returns, and refunds.",
        metaTitle: "FAQ | JPSPARE",
        metaDescription: "Find answers to common JPSPARE questions about orders, delivery, genuine products, payments, returns, and refunds.",
      },
      hero: {
        title: "Frequently Asked Questions",
        subtitle: "Help Center",
        eyebrow: "Help Center",
        description: "Quick answers to common questions about shopping for genuine car parts and accessories at JPSPARE.",
      },
      categories: [
        {
          title: "General",
          description: "Basic order, delivery, and cancellation questions.",
          enabled: true,
          sortOrder: 10,
          items: [
            {
              question: "How do I place an order?",
              answer: "Browse products, add the right items to your cart, provide delivery details, and submit your order through checkout.",
              enabled: true,
              sortOrder: 10,
            },
            {
              question: "How long does delivery take?",
              answer: "Delivery time depends on your location, product availability, payment status, and courier operations.",
              enabled: true,
              sortOrder: 20,
            },
            {
              question: "Can I cancel an order?",
              answer: "You can request cancellation before dispatch. Once an order is shipped, return or claim rules may apply.",
              enabled: true,
              sortOrder: 30,
            },
          ],
        },
        {
          title: "Products",
          description: "Product authenticity, compatibility, and warranty answers.",
          enabled: true,
          sortOrder: 20,
          items: [
            {
              question: "Are all products genuine?",
              answer: "JPSPARE focuses on genuine and trusted automotive parts sourced through reliable supplier channels.",
              enabled: true,
              sortOrder: 10,
            },
            {
              question: "How do I check compatibility?",
              answer: "Review product details and share your vehicle information with support if you need fitment confirmation before ordering.",
              enabled: true,
              sortOrder: 20,
            },
            {
              question: "Do products include warranty?",
              answer: "Warranty depends on product category, brand, supplier policy, and inspection result where applicable.",
              enabled: true,
              sortOrder: 30,
            },
          ],
        },
        {
          title: "Payments",
          description: "Payment methods and online payment security.",
          enabled: true,
          sortOrder: 30,
          items: [
            {
              question: "What payment methods are accepted?",
              answer: "Available payment options may include online payment, mobile banking, card payment, and cash-on-delivery where eligible.",
              enabled: true,
              sortOrder: 10,
            },
            {
              question: "Is online payment secure?",
              answer: "Online payments are processed through supported payment gateways and secured checkout flows.",
              enabled: true,
              sortOrder: 20,
            },
          ],
        },
        {
          title: "Returns",
          description: "Return request and refund timing answers.",
          enabled: true,
          sortOrder: 40,
          items: [
            {
              question: "How do I request a return?",
              answer: "Contact support with your order number, product details, and photos or videos if requested for inspection.",
              enabled: true,
              sortOrder: 10,
            },
            {
              question: "When will I receive my refund?",
              answer: "Refund timing depends on claim approval, payment method, product inspection, and applicable processing timelines.",
              enabled: true,
              sortOrder: 20,
            },
          ],
        },
      ],
      cta: {
        heading: "Still need help?",
        title: "Still need help?",
        description: "Contact JPSPARE support if your question is not answered here.",
        buttonText: "Contact Support",
        buttonLink: "/help",
      },
    },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeObject(defaultValue, savedValue) {
  if (!savedValue || Array.isArray(savedValue) || typeof savedValue !== "object") return clone(defaultValue);
  return { ...clone(defaultValue), ...savedValue };
}

function normalizeCms(settings = [], sections = []) {
  const settingMap = new Map(settings.map((item) => [item.key, item.value]));
  const sectionMap = new Map(sections.map((item) => [item.key, item]));

  const cms = clone(defaultHomepageCms);

  cms.announcement = normalizeAnnouncementCta(mergeObject(defaultHomepageCms.announcement, settingMap.get(homepageSettingKeys.announcement)));
  cms.announcement.rotationIntervalMs = Math.max(2500, Math.min(30000, Number(cms.announcement.rotationIntervalMs) || 10450));
  delete cms.announcement.primaryStyle;
  delete cms.announcement.secondaryStyle;
  cms.header = mergeObject(defaultHomepageCms.header, settingMap.get(homepageSettingKeys.header));
  cms.navigation = normalizeNavigation(settingMap.get(homepageSettingKeys.navigation));
  cms.seo = mergeObject(defaultHomepageCms.seo, settingMap.get(homepageSettingKeys.seo));
  cms.footer = normalizeFooter(settingMap.get(homepageSettingKeys.footer));
  cms.sitePages = normalizeSitePages(settingMap.get(homepageSettingKeys.sitePages));

  for (const [name, key] of Object.entries(homepageSectionKeys)) {
    const section = sectionMap.get(key);
    cms[name] = mergeObject(defaultHomepageCms[name], section?.content);
    if (section) cms[name].enabled = section.isActive;
  }

  if (!Array.isArray(cms.header.searchPlaceholders) || !cms.header.searchPlaceholders.length) {
    cms.header.searchPlaceholders = defaultHomepageCms.header.searchPlaceholders;
  }

  if (!Array.isArray(cms.heroSlider.slides) || !cms.heroSlider.slides.length) {
    cms.heroSlider.slides = defaultHomepageCms.heroSlider.slides;
  }

  return cms;
}

export async function getHomepageCms() {
  try {
    const [settings, sections] = await prisma.$transaction([
      prisma.siteSetting.findMany({
        where: { key: { in: Object.values(homepageSettingKeys) } },
      }),
      prisma.homeSection.findMany({
        where: { key: { in: Object.values(homepageSectionKeys) } },
        orderBy: [{ sortOrder: "asc" }],
      }),
    ]);

    return normalizeCms(settings, sections);
  } catch (error) {
    console.error("Homepage CMS fallback:", error);
    return clone(defaultHomepageCms);
  }
}

function normalizeProduct(product) {
  const thumbnail = product.images?.find((image) => image.isThumbnail) || product.images?.[0];
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price ? String(product.price) : "0",
    discountPrice: product.discountPrice ? String(product.discountPrice) : "",
    status: product.status,
    isFeatured: product.isFeatured,
    image: thumbnail?.url || "",
  };
}

export async function getHomepageAdminOptions() {
  const [categories, products, brands] = await prisma.$transaction([
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, thumbnailUrl: true, iconUrl: true, parentId: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { status: { in: ["DRAFT", "ACTIVE", "ARCHIVED"] } },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        discountPrice: true,
        status: true,
        isFeatured: true,
        images: {
          select: { url: true, isThumbnail: true, sortOrder: true },
          orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
          take: 2,
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 250,
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, logoUrl: true, isFeatured: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
  ]);

  return {
    categories,
    products: products.map(normalizeProduct),
    brands,
  };
}

function formatTaka(value) {
  const amount = Number(value || 0);
  return `Tk ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function normalizeHomepageProduct(product) {
  const thumbnail = product.images?.find((image) => image.isThumbnail) || product.images?.[0];

  return {
    category: product.category?.name || product.brand?.name || "JPSPARE",
    name: product.title,
    price: formatTaka(product.discountPrice || product.price),
    oldPrice: product.discountPrice ? formatTaka(product.price) : "",
    reviews: 5,
    image: thumbnail?.url || product.thumbnailUrl || "",
    slug: product.slug,
  };
}

export async function getHomepageFeaturedProducts(cms) {
  try {
    const featuredConfig = cms?.featuredProducts || defaultHomepageCms.featuredProducts;
    const selectedIds = cleanArray(featuredConfig.productIds);
    const limit = Math.max(1, Math.min(60, Number(featuredConfig.limit) || 20));
    const where = selectedIds.length
      ? { id: { in: selectedIds } }
      : {
          status: "ACTIVE",
          ...(featuredConfig.featuredOnly === false ? {} : { isFeatured: true }),
        };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: {
          select: { url: true, isThumbnail: true, sortOrder: true },
          orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
          take: 2,
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });

    if (!selectedIds.length) return products.map(normalizeHomepageProduct);

    const rank = new Map(selectedIds.map((id, index) => [id, index]));
    return products
      .sort((a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999))
      .map(normalizeHomepageProduct);
  } catch (error) {
    console.error("Homepage featured products fallback:", error);
    return [];
  }
}

function cleanArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizePageTextArray(value, fallback) {
  const items = cleanArray(value).map((item) => String(item || "").trim()).filter(Boolean);
  return items.length ? items : clone(fallback);
}

function normalizePageItems(value, fallback, mapper, requiredField = "title") {
  const items = cleanArray(value)
    .map(mapper)
    .filter((item) => item[requiredField])
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return items.length ? items : clone(fallback);
}

function normalizeAboutPage(value) {
  const defaultAbout = defaultHomepageCms.sitePages.about;
  const about = mergeObject(defaultAbout, value);
  const story = mergeObject(defaultAbout.story, about.story);

  return {
    ...about,
    enabled: about.enabled !== false,
    seo: mergeObject(defaultAbout.seo, about.seo),
    hero: mergeObject(defaultAbout.hero, about.hero),
    stats: normalizePageItems(
      about.stats,
      defaultAbout.stats,
      (item, index) => ({
        value: String(item?.value || "").trim(),
        label: String(item?.label || "").trim(),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      }),
      "label"
    ),
    story: {
      ...story,
      paragraphs: normalizePageTextArray(story.paragraphs, defaultAbout.story.paragraphs),
      milestones: normalizePageItems(
        story.milestones,
        defaultAbout.story.milestones,
        (item, index) => ({
          number: String(item?.number || "").trim(),
          title: String(item?.title || "").trim(),
          body: String(item?.body || "").trim(),
          enabled: item?.enabled !== false,
          sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
        })
      ),
    },
    imageBlocks: normalizePageItems(
      about.imageBlocks,
      defaultAbout.imageBlocks,
      (item, index) => ({
        eyebrow: String(item?.eyebrow || "").trim(),
        title: String(item?.title || "").trim(),
        description: String(item?.description || "").trim(),
        image: String(item?.image || "").trim(),
        imageAlt: String(item?.imageAlt || "").trim(),
        badges: normalizePageTextArray(item?.badges, defaultAbout.imageBlocks[0]?.badges || []),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      })
    ),
    values: normalizePageItems(
      about.values,
      defaultAbout.values,
      (item, index) => ({
        title: String(item?.title || "").trim(),
        body: String(item?.body || "").trim(),
        icon: String(item?.icon || "shield").trim(),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      })
    ),
    cta: mergeObject(defaultAbout.cta, about.cta),
  };
}

function normalizePrivacyPolicyPage(value) {
  const defaultPrivacy = defaultHomepageCms.sitePages.privacyPolicy;
  const privacyPolicy = mergeObject(defaultPrivacy, value);
  const principles = mergeObject(defaultPrivacy.principles, privacyPolicy.principles);

  return {
    ...privacyPolicy,
    enabled: privacyPolicy.enabled !== false,
    seo: mergeObject(defaultPrivacy.seo, privacyPolicy.seo),
    hero: mergeObject(defaultPrivacy.hero, privacyPolicy.hero),
    stats: normalizePageItems(
      privacyPolicy.stats,
      defaultPrivacy.stats,
      (item, index) => ({
        value: String(item?.value || "").trim(),
        label: String(item?.label || "").trim(),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      }),
      "label"
    ),
    principles: {
      ...principles,
      items: normalizePageItems(
        principles.items,
        defaultPrivacy.principles.items,
        (item, index) => ({
          label: String(item?.label || "").trim(),
          enabled: item?.enabled !== false,
          sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
        }),
        "label"
      ),
    },
    contact: mergeObject(defaultPrivacy.contact, privacyPolicy.contact),
    policyCards: normalizePageItems(
      privacyPolicy.policyCards,
      defaultPrivacy.policyCards,
      (item, index) => ({
        title: String(item?.title || "").trim(),
        body: String(item?.body || "").trim(),
        bullets: normalizePageTextArray(item?.bullets, defaultPrivacy.policyCards[index]?.bullets || []),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      })
    ),
    cta: mergeObject(defaultPrivacy.cta, privacyPolicy.cta),
  };
}

function normalizeReturnsWarrantyPage(value) {
  const defaultReturns = defaultHomepageCms.sitePages.returnsWarranty;
  const returnsWarranty = mergeObject(defaultReturns, value);

  const normalizePolicyList = (items, fallback) =>
    normalizePageItems(
      items,
      fallback,
      (item, index) => ({
        title: String(item?.title || "").trim(),
        description: String(item?.description || item?.body || "").trim(),
        body: String(item?.body || item?.description || "").trim(),
        bullets: normalizePageTextArray(item?.bullets, fallback[index]?.bullets || []),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      })
    );

  return {
    ...returnsWarranty,
    enabled: returnsWarranty.enabled !== false,
    seo: mergeObject(defaultReturns.seo, returnsWarranty.seo),
    hero: mergeObject(defaultReturns.hero, returnsWarranty.hero),
    stats: normalizePageItems(
      returnsWarranty.stats,
      defaultReturns.stats,
      (item, index) => ({
        value: String(item?.value || "").trim(),
        label: String(item?.label || "").trim(),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      }),
      "label"
    ),
    notice: mergeObject(defaultReturns.notice, returnsWarranty.notice),
    returnPolicies: normalizePolicyList(returnsWarranty.returnPolicies, defaultReturns.returnPolicies),
    warrantyPolicies: normalizePolicyList(returnsWarranty.warrantyPolicies, defaultReturns.warrantyPolicies),
    claimChecklist: normalizePageItems(
      returnsWarranty.claimChecklist,
      defaultReturns.claimChecklist,
      (item, index) => ({
        label: String(item?.label || "").trim(),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      }),
      "label"
    ),
    supportContact: mergeObject(defaultReturns.supportContact, returnsWarranty.supportContact),
    cta: mergeObject(defaultReturns.cta, returnsWarranty.cta),
  };
}

function normalizeHelpPage(value) {
  const defaultHelp = defaultHomepageCms.sitePages.help;
  const help = mergeObject(defaultHelp, value);
  const businessHours = mergeObject(defaultHelp.businessHours, help.businessHours);

  return {
    ...help,
    enabled: help.enabled !== false,
    seo: mergeObject(defaultHelp.seo, help.seo),
    hero: mergeObject(defaultHelp.hero, help.hero),
    intro: mergeObject(defaultHelp.intro, help.intro),
    contactCards: normalizePageItems(
      help.contactCards,
      defaultHelp.contactCards,
      (item, index) => ({
        title: String(item?.title || "").trim(),
        detail: String(item?.detail || "").trim(),
        sub: String(item?.sub || "").trim(),
        note: String(item?.note || "").trim(),
        icon: String(item?.icon || "phone").trim(),
        tone: String(item?.tone || "orange").trim(),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      })
    ),
    businessHours: {
      ...businessHours,
      items: normalizePageItems(
        businessHours.items,
        defaultHelp.businessHours.items,
        (item, index) => ({
          label: String(item?.label || "").trim(),
          value: String(item?.value || "").trim(),
          enabled: item?.enabled !== false,
          sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
        }),
        "label"
      ),
    },
    emergencySupport: mergeObject(defaultHelp.emergencySupport, help.emergencySupport),
    supportBenefits: normalizePageItems(
      help.supportBenefits,
      defaultHelp.supportBenefits,
      (item, index) => ({
        title: String(item?.title || "").trim(),
        description: String(item?.description || item?.body || "").trim(),
        body: String(item?.body || item?.description || "").trim(),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      })
    ),
    helpTopics: normalizePageItems(
      help.helpTopics,
      defaultHelp.helpTopics,
      (item, index) => ({
        title: String(item?.title || "").trim(),
        description: String(item?.description || item?.body || "").trim(),
        body: String(item?.body || item?.description || "").trim(),
        icon: String(item?.icon || "check").trim(),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      })
    ),
    cta: mergeObject(defaultHelp.cta, help.cta),
  };
}

function normalizeGenericPolicyPage(value, defaultPage) {
  const page = mergeObject(defaultPage, value);

  return {
    ...page,
    enabled: page.enabled !== false,
    seo: {
      ...mergeObject(defaultPage.seo, page.seo),
      title: String(page.seo?.title || page.seo?.metaTitle || defaultPage.seo.title || defaultPage.seo.metaTitle || "").trim(),
      description: String(page.seo?.description || page.seo?.metaDescription || defaultPage.seo.description || defaultPage.seo.metaDescription || "").trim(),
      metaTitle: String(page.seo?.metaTitle || page.seo?.title || defaultPage.seo.metaTitle || defaultPage.seo.title || "").trim(),
      metaDescription: String(page.seo?.metaDescription || page.seo?.description || defaultPage.seo.metaDescription || defaultPage.seo.description || "").trim(),
    },
    hero: {
      ...mergeObject(defaultPage.hero, page.hero),
      title: String(page.hero?.title || defaultPage.hero.title || "").trim(),
      subtitle: String(page.hero?.subtitle || page.hero?.eyebrow || defaultPage.hero.subtitle || defaultPage.hero.eyebrow || "").trim(),
      eyebrow: String(page.hero?.eyebrow || page.hero?.subtitle || defaultPage.hero.eyebrow || defaultPage.hero.subtitle || "").trim(),
      description: String(page.hero?.description || defaultPage.hero.description || "").trim(),
    },
    sections: normalizePageItems(
      page.sections,
      defaultPage.sections,
      (item, index) => ({
        title: String(item?.title || "").trim(),
        description: String(item?.description || item?.body || "").trim(),
        body: String(item?.body || item?.description || "").trim(),
        bullets: normalizePageTextArray(item?.bullets, defaultPage.sections[index]?.bullets || []),
        enabled: item?.enabled !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      })
    ),
    cta: {
      ...mergeObject(defaultPage.cta, page.cta),
      heading: String(page.cta?.heading || page.cta?.title || defaultPage.cta.heading || defaultPage.cta.title || "").trim(),
      title: String(page.cta?.title || page.cta?.heading || defaultPage.cta.title || defaultPage.cta.heading || "").trim(),
      description: String(page.cta?.description || defaultPage.cta.description || "").trim(),
      buttonText: String(page.cta?.buttonText || defaultPage.cta.buttonText || "").trim(),
      buttonLink: String(page.cta?.buttonLink || defaultPage.cta.buttonLink || "/help").trim(),
    },
  };
}

function normalizeFaqPage(value) {
  const defaultFaq = defaultHomepageCms.sitePages.faq;
  const faq = mergeObject(defaultFaq, value);

  return {
    ...faq,
    enabled: faq.enabled !== false,
    seo: {
      ...mergeObject(defaultFaq.seo, faq.seo),
      title: String(faq.seo?.title || faq.seo?.metaTitle || defaultFaq.seo.title || defaultFaq.seo.metaTitle || "").trim(),
      description: String(faq.seo?.description || faq.seo?.metaDescription || defaultFaq.seo.description || defaultFaq.seo.metaDescription || "").trim(),
      metaTitle: String(faq.seo?.metaTitle || faq.seo?.title || defaultFaq.seo.metaTitle || defaultFaq.seo.title || "").trim(),
      metaDescription: String(faq.seo?.metaDescription || faq.seo?.description || defaultFaq.seo.metaDescription || defaultFaq.seo.description || "").trim(),
    },
    hero: {
      ...mergeObject(defaultFaq.hero, faq.hero),
      title: String(faq.hero?.title || defaultFaq.hero.title || "").trim(),
      subtitle: String(faq.hero?.subtitle || faq.hero?.eyebrow || defaultFaq.hero.subtitle || defaultFaq.hero.eyebrow || "").trim(),
      eyebrow: String(faq.hero?.eyebrow || faq.hero?.subtitle || defaultFaq.hero.eyebrow || defaultFaq.hero.subtitle || "").trim(),
      description: String(faq.hero?.description || defaultFaq.hero.description || "").trim(),
    },
    categories: normalizePageItems(
      faq.categories,
      defaultFaq.categories,
      (category, categoryIndex) => {
        const defaultCategory = defaultFaq.categories[categoryIndex] || {};
        return {
          title: String(category?.title || defaultCategory.title || "").trim(),
          description: String(category?.description || category?.body || defaultCategory.description || "").trim(),
          body: String(category?.body || category?.description || defaultCategory.description || "").trim(),
          enabled: category?.enabled !== false,
          sortOrder: Number.isFinite(Number(category?.sortOrder)) ? Number(category.sortOrder) : (categoryIndex + 1) * 10,
          items: normalizePageItems(
            category?.items,
            defaultCategory.items || [],
            (item, itemIndex) => ({
              question: String(item?.question || item?.title || "").trim(),
              title: String(item?.title || item?.question || "").trim(),
              answer: String(item?.answer || item?.description || item?.body || "").trim(),
              description: String(item?.description || item?.answer || item?.body || "").trim(),
              body: String(item?.body || item?.answer || item?.description || "").trim(),
              enabled: item?.enabled !== false,
              sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (itemIndex + 1) * 10,
            })
          ),
        };
      }
    ),
    cta: {
      ...mergeObject(defaultFaq.cta, faq.cta),
      heading: String(faq.cta?.heading || faq.cta?.title || defaultFaq.cta.heading || defaultFaq.cta.title || "").trim(),
      title: String(faq.cta?.title || faq.cta?.heading || defaultFaq.cta.title || defaultFaq.cta.heading || "").trim(),
      description: String(faq.cta?.description || defaultFaq.cta.description || "").trim(),
      buttonText: String(faq.cta?.buttonText || defaultFaq.cta.buttonText || "").trim(),
      buttonLink: String(faq.cta?.buttonLink || defaultFaq.cta.buttonLink || "/help").trim(),
    },
  };
}

function normalizeSitePages(value) {
  const sitePages = mergeObject(defaultHomepageCms.sitePages, value);

  return {
    ...sitePages,
    about: normalizeAboutPage(sitePages.about),
    privacyPolicy: normalizePrivacyPolicyPage(sitePages.privacyPolicy),
    returnsWarranty: normalizeReturnsWarrantyPage(sitePages.returnsWarranty),
    help: normalizeHelpPage(sitePages.help),
    terms: normalizeGenericPolicyPage(sitePages.terms, defaultHomepageCms.sitePages.terms),
    shipping: normalizeGenericPolicyPage(sitePages.shipping, defaultHomepageCms.sitePages.shipping),
    faq: normalizeFaqPage(sitePages.faq),
  };
}

function normalizeNavigationItem(item, index) {
  const fallback = defaultHomepageCms.navigation.main[index] || {};

  return {
    label: String(item?.label || fallback.label || "").trim(),
    href: String(item?.href || fallback.href || "#").trim(),
    enabled: item?.enabled !== false,
    sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : fallback.sortOrder || (index + 1) * 10,
    hasMenu: item?.hasMenu === undefined ? Boolean(fallback.hasMenu) : item.hasMenu === true,
  };
}

function normalizeNavigation(value) {
  const navigation = mergeObject(defaultHomepageCms.navigation, value);
  const defaultMegaMenu = defaultHomepageCms.navigation.megaMenu;
  const megaMenu = mergeObject(defaultMegaMenu, navigation.megaMenu);

  const main = cleanArray(navigation.main)
    .map(normalizeNavigationItem)
    .filter((item) => item.label && item.href)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  megaMenu.promoCard = mergeObject(defaultMegaMenu.promoCard, megaMenu.promoCard);
  megaMenu.helpBar = mergeObject(defaultMegaMenu.helpBar, megaMenu.helpBar);
  megaMenu.helpBar.phone = String(megaMenu.helpBar.phone || megaMenu.helpBar.callNumber || defaultMegaMenu.helpBar.phone).trim();
  megaMenu.helpBar.callNumber = String(megaMenu.helpBar.callNumber || megaMenu.helpBar.phone || defaultMegaMenu.helpBar.callNumber).trim();
  megaMenu.helpBar.chatLink = String(megaMenu.helpBar.chatLink || defaultMegaMenu.helpBar.chatLink).trim();
  megaMenu.featureCards = cleanArray(megaMenu.featureCards)
    .map((card, index) => ({
      icon: String(card?.icon || "tag").trim(),
      title: String(card?.title || "").trim(),
      subtitle: String(card?.subtitle || "").trim(),
      enabled: card?.enabled !== false,
      sortOrder: Number.isFinite(Number(card?.sortOrder)) ? Number(card.sortOrder) : (index + 1) * 10,
    }))
    .filter((card) => card.title)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  megaMenu.featuredBrands = cleanArray(megaMenu.featuredBrands)
    .map((brand, index) => ({
      label: String(brand?.label || brand?.name || "").trim(),
      href: String(brand?.href || "").trim(),
      logo: String(brand?.logo || "").trim(),
      enabled: brand?.enabled !== false,
      sortOrder: Number.isFinite(Number(brand?.sortOrder)) ? Number(brand.sortOrder) : (index + 1) * 10,
    }))
    .filter((brand) => brand.label && brand.href)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  megaMenu.categoryRail = cleanArray(megaMenu.categoryRail)
    .map((item, index) => ({
      key: String(item?.key || "").trim(),
      label: String(item?.label || "").trim(),
      icon: String(item?.icon || "package").trim(),
      enabled: item?.enabled !== false,
      sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
    }))
    .filter((item) => item.key && item.label)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    main: main.length ? main : clone(defaultHomepageCms.navigation.main),
    megaMenu: {
      ...megaMenu,
      enabled: megaMenu.enabled !== false,
      featureCards: megaMenu.featureCards.length ? megaMenu.featureCards : clone(defaultMegaMenu.featureCards),
      featuredBrands: megaMenu.featuredBrands.length ? megaMenu.featuredBrands : clone(defaultMegaMenu.featuredBrands),
      categoryRail: megaMenu.categoryRail.length ? megaMenu.categoryRail : clone(defaultMegaMenu.categoryRail),
    },
  };
}

function normalizeFooterLink(item, index) {
  return {
    label: String(item?.label || "").trim(),
    href: String(item?.href || "#").trim(),
    enabled: item?.enabled !== false,
    sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
  };
}

function normalizeFooterLinks(value, fallback) {
  const links = cleanArray(value)
    .map(normalizeFooterLink)
    .filter((item) => item.label && item.href)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return links.length ? links : clone(fallback);
}

function normalizePaymentIcons(value, fallback) {
  const icons = cleanArray(value)
    .map((item, index) => ({
      ...normalizeFooterLink(item, index),
      image: String(item?.image || "").trim(),
    }))
    .filter((item) => item.label && item.image)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return icons.length ? icons : clone(fallback);
}

function normalizeFooter(value) {
  const footer = mergeObject(defaultHomepageCms.footer, value);
  const defaultFooter = defaultHomepageCms.footer;
  const contacts = mergeObject(defaultFooter.contacts, footer.contacts || footer.contact);
  const socials = mergeObject(defaultFooter.socials, footer.socials || footer.socialLinks);

  const normalized = {
    ...footer,
    logo: footer.logo || footer.footerLogo || defaultFooter.logo,
    about: footer.about || footer.aboutText || defaultFooter.about,
    copyright: footer.copyright || footer.copyrightText || defaultFooter.copyright,
    contacts,
    socials,
    quickLinks: normalizeFooterLinks(footer.quickLinks, defaultFooter.quickLinks),
    customerLinks: normalizeFooterLinks(footer.customerLinks, defaultFooter.customerLinks),
    accountLinks: normalizeFooterLinks(footer.accountLinks, defaultFooter.accountLinks),
    companyLinks: normalizeFooterLinks(footer.companyLinks, defaultFooter.companyLinks),
    paymentIcons: normalizePaymentIcons(footer.paymentIcons, defaultFooter.paymentIcons),
    appBadges: mergeObject(defaultFooter.appBadges, footer.appBadges),
    trustBadges: cleanArray(footer.trustBadges)
      .map((badge, index) => ({
        label: String(badge?.label || "").trim(),
        icon: String(badge?.icon || "check").trim(),
        enabled: badge?.enabled !== false,
        sortOrder: Number.isFinite(Number(badge?.sortOrder)) ? Number(badge.sortOrder) : (index + 1) * 10,
      }))
      .filter((badge) => badge.label)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };

  normalized.footerLogo = normalized.logo;
  normalized.aboutText = normalized.about;
  normalized.copyrightText = normalized.copyright;
  normalized.contact = mergeObject(defaultFooter.contact, contacts);
  normalized.socialLinks = mergeObject(defaultFooter.socialLinks, socials);
  normalized.bottomImage = normalized.bottomImage || defaultFooter.bottomImage;
  normalized.trustBadges = normalized.trustBadges.length ? normalized.trustBadges : clone(defaultFooter.trustBadges);

  return normalized;
}

function normalizeAnnouncementCta(announcement) {
  const ctaPattern = /(?:\s*\.?\s*)(Hurry Up\s*→?)\s*$/i;
  const text = String(announcement.text || "");
  const match = text.match(ctaPattern);

  if (!match) return announcement;

  return {
    ...announcement,
    text: text.replace(ctaPattern, "").trim(),
    buttonText: announcement.buttonText || "Hurry Up →",
  };
}

function sanitizeCmsPayload(payload = {}) {
  const cms = normalizeCms([], []);
  const incoming = payload || {};

  cms.announcement = normalizeAnnouncementCta(mergeObject(cms.announcement, incoming.announcement));
  cms.announcement.rotationIntervalMs = Math.max(2500, Math.min(30000, Number(cms.announcement.rotationIntervalMs) || 10450));
  delete cms.announcement.primaryStyle;
  delete cms.announcement.secondaryStyle;
  cms.header = mergeObject(cms.header, incoming.header);
  cms.header.searchPlaceholders = cleanArray(cms.header.searchPlaceholders).map((item) => String(item).trim()).filter(Boolean);
  cms.navigation = normalizeNavigation(incoming.navigation);
  cms.seo = mergeObject(cms.seo, incoming.seo);
  cms.footer = normalizeFooter(incoming.footer);
  cms.sitePages = normalizeSitePages(incoming.sitePages);

  cms.heroSlider = mergeObject(cms.heroSlider, incoming.heroSlider);
  cms.heroSlider.slides = cleanArray(cms.heroSlider.slides).map((slide, index) => ({
    id: slide.id || `slide-${Date.now()}-${index}`,
    desktopImage: slide.desktopImage || slide.src || "",
    mobileImage: slide.mobileImage || slide.desktopImage || slide.src || "",
    alt: slide.alt || slide.heading || "JPSPARE hero banner",
    heading: slide.heading || "",
    subheading: slide.subheading || "",
    ctaText: slide.ctaText || "",
    ctaLink: slide.ctaLink || "",
    active: slide.active !== false,
  }));

  cms.featuredCategories = mergeObject(cms.featuredCategories, incoming.featuredCategories);
  cms.featuredCategories.categoryIds = cleanArray(cms.featuredCategories.categoryIds);

  cms.featuredProducts = mergeObject(cms.featuredProducts, incoming.featuredProducts);
  cms.featuredProducts.productIds = cleanArray(cms.featuredProducts.productIds);
  cms.featuredProducts.limit = Math.max(1, Math.min(60, Number(cms.featuredProducts.limit) || 20));

  cms.promoBanners = mergeObject(cms.promoBanners, incoming.promoBanners);
  cms.promoBanners.banners = cleanArray(cms.promoBanners.banners).map((banner, index) => ({
    id: banner.id || `promo-${Date.now()}-${index}`,
    image: banner.image || "",
    title: banner.title || "",
    subtitle: banner.subtitle || "",
    ctaText: banner.ctaText || "",
    ctaLink: banner.ctaLink || "",
    active: banner.active !== false,
  }));

  cms.brandShowcase = mergeObject(cms.brandShowcase, incoming.brandShowcase);
  cms.brandShowcase.brandIds = cleanArray(cms.brandShowcase.brandIds);

  return cms;
}

function upsertSetting(key, value, group) {
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value, group, isPublic: true },
    update: { value, group, isPublic: true },
  });
}

function upsertSection(key, title, type, content, sortOrder, isActive) {
  return prisma.homeSection.upsert({
    where: { key },
    create: { key, title, type, content, sortOrder, isActive },
    update: { title, type, content, sortOrder, isActive },
  });
}

export async function saveHomepageCms(payload) {
  const cms = sanitizeCmsPayload(payload);

  await prisma.$transaction([
    upsertSetting(homepageSettingKeys.announcement, cms.announcement, "homepage"),
    upsertSetting(homepageSettingKeys.header, cms.header, "homepage"),
    upsertSetting(homepageSettingKeys.navigation, cms.navigation, "navigation"),
    upsertSetting(homepageSettingKeys.seo, cms.seo, "homepage"),
    upsertSetting(homepageSettingKeys.footer, cms.footer, "footer"),
    upsertSection(homepageSectionKeys.heroSlider, "Hero Banner Slider", "hero", cms.heroSlider, 10, cms.heroSlider.enabled !== false),
    upsertSection(homepageSectionKeys.featuredCategories, "Featured Categories", "categories", cms.featuredCategories, 20, cms.featuredCategories.enabled !== false),
    upsertSection(homepageSectionKeys.featuredProducts, "Featured Products", "products", cms.featuredProducts, 30, cms.featuredProducts.enabled !== false),
    upsertSection(homepageSectionKeys.promoBanners, "Promo Banners", "banners", cms.promoBanners, 40, cms.promoBanners.enabled !== false),
    upsertSection(homepageSectionKeys.brandShowcase, "Brand Showcase", "brands", cms.brandShowcase, 50, cms.brandShowcase.enabled !== false),
  ]);

  return cms;
}
