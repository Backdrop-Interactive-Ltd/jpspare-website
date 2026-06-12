import TopDealBar from "../TopDealBar";
import { Header } from "../page";
import ProductsPageClient from "./ProductsPageClient";

export const metadata = {
  title: "All Products | JPSPARE",
  description: "Browse all authentic auto parts and accessories available from JPSPARE.",
};

function getValue(value, fallback = "") {
  return Array.isArray(value) ? value[0] || fallback : value || fallback;
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <TopDealBar />
      <Header />
      <ProductsPageClient
        initialFilters={{
          q: getValue(params?.q || params?.search),
          category: getValue(params?.category),
          brand: getValue(params?.brand),
          sort: getValue(params?.sort, "newest"),
          page: getValue(params?.page, "1"),
        }}
      />
    </>
  );
}
