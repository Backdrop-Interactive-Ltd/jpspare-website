import ComparePageClient from "./ComparePageClient";
import { Header } from "../page";

export const metadata = {
  title: "Product Comparison | JPSPARE",
  description: "Compare selected JPSPARE auto parts side by side.",
};

export default function ComparePage() {
  return (
    <>
      <Header />
      <ComparePageClient />
    </>
  );
}
