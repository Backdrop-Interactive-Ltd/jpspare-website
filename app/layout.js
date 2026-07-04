import "./globals.css";
import PublicChrome from "./PublicChrome";
import CompareFloatingPanel from "./CompareFloatingPanel";
import { Inter } from "next/font/google";
import { defaultHomepageCms, getHomepageCms } from "@/lib/homepage/cms";
import { buildOrganizationSchema, buildWebsiteSchema, jsonLdScript } from "@/lib/seo/structured-data";

const topDealFont = Inter({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-top-deal",
});

const fallbackSeoManager = defaultHomepageCms.seoManager;
const fallbackMetadata = {
  siteName: "JPSPARE",
  titleTemplate: "%s | JPSPARE",
  defaultTitle: "JPSPARE | Premium Auto Parts & Accessories",
  defaultDescription: "Shop demo premium auto parts and accessories for Japanese vehicles.",
  defaultOgImage: "/jpspare-logo-wide-clean.png",
  canonicalBaseUrl: fallbackSeoManager.global.canonicalBaseUrl,
};

function cleanText(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function safeUrl(value, fallback) {
  try {
    return new URL(cleanText(value, fallback));
  } catch {
    return new URL(fallback);
  }
}

function safeImage(value, baseUrl, fallback) {
  const image = cleanText(value, fallback);
  try {
    return new URL(image, baseUrl).toString();
  } catch {
    return new URL(fallback, baseUrl).toString();
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

export async function generateMetadata() {
  const seoManager = await getSeoManager();
  const global = seoManager.global || fallbackSeoManager.global;
  const organization = seoManager.organization || fallbackSeoManager.organization;
  const socialProfiles = seoManager.socialProfiles || fallbackSeoManager.socialProfiles;
  const siteName = cleanText(global.siteName || organization.name, fallbackMetadata.siteName);
  const defaultTitle = cleanText(global.defaultTitle, fallbackMetadata.defaultTitle);
  const defaultDescription = cleanText(global.defaultDescription, fallbackMetadata.defaultDescription);
  const titleTemplate = cleanText(global.titleTemplate, fallbackMetadata.titleTemplate);
  const metadataBase = safeUrl(global.canonicalBaseUrl || organization.url, fallbackMetadata.canonicalBaseUrl);
  const defaultOgImage = safeImage(global.defaultOgImage, metadataBase, fallbackMetadata.defaultOgImage);
  const twitterHandle = cleanText(global.twitterHandle, socialProfiles.twitter || "");

  return {
    metadataBase,
    title: {
      default: defaultTitle,
      template: titleTemplate,
    },
    description: defaultDescription,
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      siteName,
      images: [defaultOgImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      creator: twitterHandle,
      images: [defaultOgImage],
    },
  };
}

export default async function RootLayout({ children }) {
  const seoManager = await getSeoManager();
  const organizationSchema = buildOrganizationSchema(seoManager.organization || fallbackSeoManager.organization);
  const websiteSchema = buildWebsiteSchema(seoManager.website || fallbackSeoManager.website);

  return (
    <html lang="en" className={`h-full antialiased ${topDealFont.variable}`}>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationSchema)} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(websiteSchema)} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var storedMode = localStorage.getItem("jpspare-theme-mode");
                  var mode = storedMode === "dark" || storedMode === "light" ? storedMode : "light";
                  var isDark = mode === "dark";
                  document.documentElement.dataset.themeMode = mode;
                  document.documentElement.dataset.theme = isDark ? "dark" : "light";
                } catch (error) {
                  document.documentElement.dataset.themeMode = "light";
                  document.documentElement.dataset.theme = "light";
                }
              })();
            `,
          }}
        />
        {children}
        <PublicChrome />
        <CompareFloatingPanel />
      </body>
    </html>
  );
}
