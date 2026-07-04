import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import CollectionPageClient from "../collection-page/CollectionPageClient";

export const metadata = {
  title: "Modification | JPSPARE",
  description: "Demo modification parts and accessories collection for JPSPARE.",
};

export default function ModificationPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <CollectionPageClient pageKey="modification" />
    </>
  );
}
