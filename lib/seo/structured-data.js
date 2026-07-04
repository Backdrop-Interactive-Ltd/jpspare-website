const defaultBaseUrl = "https://jpspare.com";

function cleanText(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function cleanArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeUrl(value, baseUrl = defaultBaseUrl) {
  const clean = cleanText(value);
  if (!clean) return "";

  try {
    return new URL(clean, baseUrl).toString();
  } catch {
    return "";
  }
}

function safeNumber(value) {
  if (value === null || value === undefined) return null;
  const number = Number(typeof value?.toString === "function" ? value.toString() : value);
  return Number.isFinite(number) ? number : null;
}

function safeDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (Array.isArray(item)) return item.length > 0;
      if (item && typeof item === "object") return Object.keys(item).length > 0;
      return item !== "" && item !== null && item !== undefined;
    })
  );
}

export function jsonLdScript(schema) {
  return {
    __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
  };
}

export function buildOrganizationSchema(organization = {}) {
  const baseUrl = safeUrl(organization.url) || defaultBaseUrl;
  const sameAs = cleanArray(organization.sameAs).map((item) => safeUrl(item, baseUrl)).filter(Boolean);

  return compactObject({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: cleanText(organization.name, "JPSPARE"),
    url: baseUrl,
    logo: safeUrl(organization.logo, baseUrl),
    email: cleanText(organization.email),
    telephone: cleanText(organization.phone),
    address: cleanText(organization.address),
    sameAs,
  });
}

export function buildWebsiteSchema(website = {}) {
  const baseUrl = safeUrl(website.url) || defaultBaseUrl;
  const searchUrl = cleanText(website.searchUrl, `${baseUrl}/products?q={search_term_string}`);

  return compactObject({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: cleanText(website.name, "JPSPARE"),
    url: baseUrl,
    potentialAction: compactObject({
      "@type": "SearchAction",
      target: safeUrl(searchUrl, baseUrl),
      "query-input": "required name=search_term_string",
    }),
  });
}

export function buildProductSchema(product = {}, options = {}) {
  const baseUrl = safeUrl(options.baseUrl) || defaultBaseUrl;
  const productUrl = safeUrl(options.url || `/products/${product.slug || ""}`, baseUrl);
  const images = cleanArray(product.images)
    .map((image) => safeUrl(image?.url || image, baseUrl))
    .filter(Boolean);
  const fallbackImage = safeUrl(product.image || product.featuredImage, baseUrl);
  const price = safeNumber(product.discountPrice ?? product.price);
  const inStock = product.stockStatus !== "OUT_OF_STOCK";

  return compactObject({
    "@context": "https://schema.org",
    "@type": "Product",
    name: cleanText(product.title || product.name),
    description: cleanText(product.shortDescription || product.description || product.fullDescription),
    sku: cleanText(product.sku),
    image: images.length ? images : fallbackImage ? [fallbackImage] : [],
    brand: product.brand?.name
      ? {
          "@type": "Brand",
          name: cleanText(product.brand.name),
        }
      : undefined,
    category: cleanText(product.category?.name),
    url: productUrl,
    offers:
      price === null
        ? undefined
        : compactObject({
            "@type": "Offer",
            url: productUrl,
            price,
            priceCurrency: options.currency || "BDT",
            availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
            itemCondition: "https://schema.org/NewCondition",
          }),
  });
}

export function buildBreadcrumbSchema(items = [], options = {}) {
  const baseUrl = safeUrl(options.baseUrl) || defaultBaseUrl;
  const itemListElement = cleanArray(items)
    .map((item, index) => {
      const name = cleanText(item?.name || item?.label);
      const url = safeUrl(item?.url || item?.href, baseUrl);
      if (!name || !url) return null;

      return {
        "@type": "ListItem",
        position: index + 1,
        name,
        item: url,
      };
    })
    .filter(Boolean);

  return compactObject({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  });
}

export function buildBlogPostingSchema(post = {}, options = {}) {
  const baseUrl = safeUrl(options.baseUrl) || defaultBaseUrl;
  const postUrl = safeUrl(options.url || `/blog/${post.slug || ""}`, baseUrl);
  const image = safeUrl(post.featuredImage || post.image, baseUrl);
  const publishedAt = safeDate(post.publishedAt || post.date);
  const modifiedAt = safeDate(post.updatedAt || post.publishedAt || post.date);

  return compactObject({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: cleanText(post.title),
    description: cleanText(post.excerpt || post.summary),
    image: image ? [image] : [],
    url: postUrl,
    datePublished: publishedAt,
    dateModified: modifiedAt,
    author: {
      "@type": "Person",
      name: cleanText(post.authorName || post.author, "JPSPARE Experts"),
    },
    publisher: {
      "@type": "Organization",
      name: "JPSPARE",
      logo: {
        "@type": "ImageObject",
        url: safeUrl("/jpspare-logo-wide-clean.png", baseUrl),
      },
    },
  });
}
