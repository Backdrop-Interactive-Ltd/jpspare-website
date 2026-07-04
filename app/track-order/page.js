import TrackOrderPageClient from "./TrackOrderPageClient";
import { Header } from "../homepage/site-header";

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
