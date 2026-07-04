import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import CategoryProductsClient from "../category-products/CategoryProductsClient";

export const metadata = {
  title: "Tyres | JPSPARE",
  description: "Shop demo tyres and tyre accessories with filters for JPSPARE.",
};

export default function TyresPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <CategoryProductsClient categoryKey="TYRES" />
    </>
  );
}
