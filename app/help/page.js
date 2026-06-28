import HelpPageClient from "./HelpPageClient";
import TopDealBar from "../TopDealBar";
import { Header } from "../page";

export const metadata = {
  title: "Help Center | JPSPARE",
  description: "Get support, request a part quote, and find JPSPARE contact information.",
};

export default function HelpPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <HelpPageClient />
    </>
  );
}
