import SearchResultsClient from "./SearchResultsClient";

export const metadata = {
  title: "Search Products | JPSPARE",
  description: "Search JPSPARE products by keyword, category, and product name.",
};

export default async function SearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams?.q === "string" ? resolvedParams.q.trim() : "";

  return <SearchResultsClient query={query} />;
}
