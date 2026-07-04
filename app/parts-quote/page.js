import TopDealBar from "../TopDealBar";
import PartQuoteRequestSection from "../PartQuoteRequestSection";
import { Header } from "../homepage/site-header";

export const metadata = {
  title: "Parts Quote | JPSPARE",
  description: "Request a JPSPARE price quote for hard-to-find Japanese auto parts and accessories.",
};

export default function PartsQuotePage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <main className="bg-[#f4f6f8]">
        <PartQuoteRequestSection />
      </main>
    </>
  );
}
