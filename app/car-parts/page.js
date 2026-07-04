import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import CategoryProductsClient from "../category-products/CategoryProductsClient";

export const metadata = {
  title: "Car Parts | JPSPARE",
  description: "Shop demo authentic Japanese car parts with filters for JPSPARE.",
};

export default function CarPartsPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <CategoryProductsClient categoryKey="CAR PARTS" />
    </>
  );
}
