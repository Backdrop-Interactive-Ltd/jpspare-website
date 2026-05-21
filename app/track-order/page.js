import TrackOrderPageClient from "./TrackOrderPageClient";

export const metadata = {
  title: "Track Order | JPSPARE",
  description: "Track your JPSPARE order shipment status.",
};

export default function TrackOrderPage() {
  return <TrackOrderPageClient />;
}
