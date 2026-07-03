import HelpPageClient from "./HelpPageClient";
import TopDealBar from "../TopDealBar";
import { Header } from "../page";
import { getHomepageCms } from "@/lib/homepage/cms";

const fallbackMetadata = {
  title: "Help Center | JPSPARE",
  description: "Get support, request a part quote, and find JPSPARE contact information.",
};

export const dynamic = "force-dynamic";

async function getHelpCms() {
  try {
    const cms = await getHomepageCms();
    return cms?.sitePages?.help || null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const help = await getHelpCms();

  return {
    title: help?.seo?.metaTitle || fallbackMetadata.title,
    description: help?.seo?.metaDescription || fallbackMetadata.description,
  };
}

export default async function HelpPage() {
  const help = await getHelpCms();

  return (
    <>
      <TopDealBar />
      <Header />
      <HelpPageClient help={help} />
    </>
  );
}
