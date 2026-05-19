import TopDealBar from "../TopDealBar";
import { Header } from "../page";
import CollectionPageClient from "../collection-page/CollectionPageClient";

export const metadata = {
  title: "Brands | JPSPARE",
  description: "Demo premium brands collection for JPSPARE.",
};

export default function BrandsPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <CollectionPageClient pageKey="brands" />
    </>
  );
}
