import { defaultHomepageCms, getHomepageCms } from "@/lib/homepage/cms";

const fallbackSeoManager = defaultHomepageCms.seoManager;

function cleanText(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function safeBaseUrl(value) {
  try {
    return new URL(cleanText(value, fallbackSeoManager.global.canonicalBaseUrl)).origin;
  } catch {
    return new URL(fallbackSeoManager.global.canonicalBaseUrl).origin;
  }
}

async function getSeoManager() {
  try {
    const cms = await getHomepageCms();
    return cms?.seoManager || fallbackSeoManager;
  } catch {
    return fallbackSeoManager;
  }
}

function robotRule(userAgent, index, follow) {
  return {
    userAgent,
    ...(index && follow ? { allow: "/" } : { disallow: "/" }),
  };
}

export default async function robots() {
  const seoManager = await getSeoManager();
  const robotsConfig = seoManager.robots || fallbackSeoManager.robots;
  const baseUrl = safeBaseUrl(seoManager.global?.canonicalBaseUrl);

  return {
    rules: [
      robotRule("*", robotsConfig.index !== false, robotsConfig.follow !== false),
      robotRule("Googlebot", robotsConfig.googleBotIndex !== false, robotsConfig.googleBotFollow !== false),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
