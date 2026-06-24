import TrackOrderPageClient from "./TrackOrderPageClient";
import { Header } from "../page";

export const metadata = {
  title: "Track Order | JPSPARE",
  description: "Track your JPSPARE order shipment status.",
};

export default function TrackOrderPage() {
  return (
    <>
      <Header />
      <TrackOrderPageClient />
    </>
  );
}
