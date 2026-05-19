import TopDealBar from "../TopDealBar";
import { Header } from "../page";
import CarAccessoriesClient from "./CarAccessoriesClient";

export const metadata = {
  title: "Car Accessories | JPSPARE",
  description: "Shop demo car accessories with category filters for JPSPARE.",
};

export default function CarAccessoriesPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <CarAccessoriesClient />
    </>
  );
}
