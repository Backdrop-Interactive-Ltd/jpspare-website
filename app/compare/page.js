import ComparePageClient from "./ComparePageClient";
import { Header } from "../homepage/site-header";

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
