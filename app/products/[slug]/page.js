import ProductDetailClient from "./ProductDetailClient";
import { MainNavBar } from "../../page";

export const metadata = {
  title: "Product Details | JPSPARE",
  description: "Demo product details page for JPSPARE auto parts ecommerce.",
};

export default async function ProductPage({ params }) {
  const { slug } = await params;

  return (
    <>
      <MainNavBar showTrackOrder={false} />
      <ProductDetailClient slug={slug} />
    </>
  );
}
