import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import CategoryProductsClient from "../category-products/CategoryProductsClient";

export const metadata = {
  title: "Lubricant | JPSPARE",
  description: "Shop demo lubricants, additives and fluids with filters for JPSPARE.",
};

export default function LubricantPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <CategoryProductsClient categoryKey="LUBRICANT" />
    </>
  );
}
