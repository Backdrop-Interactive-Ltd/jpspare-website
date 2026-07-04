import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import CollectionPageClient from "../collection-page/CollectionPageClient";

export const metadata = {
  title: "Combo Package | JPSPARE",
  description: "Demo combo package collection for JPSPARE.",
};

export default function ComboPackagePage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <CollectionPageClient pageKey="combo-package" />
    </>
  );
}
