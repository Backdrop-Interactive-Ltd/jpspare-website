import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import CollectionPageClient from "../collection-page/CollectionPageClient";

export const metadata = {
  title: "Sale Offer | JPSPARE",
  description: "Demo sale offer collection for JPSPARE.",
};

export default function SaleOfferPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <CollectionPageClient pageKey="sale-offer" />
    </>
  );
}
