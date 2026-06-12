import TopDealBar from "../TopDealBar";
import PartsInquirySection from "../PartsInquirySection";
import { Header } from "../page";

export const metadata = {
  title: "Parts Quote | JPSPARE",
  description: "Request a JPSPARE price quote for hard-to-find Japanese auto parts and accessories.",
};

export default function PartsQuotePage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <main className="bg-[#eef0f5]">
        <PartsInquirySection mode="page" />
      </main>
    </>
  );
}
