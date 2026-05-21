import DashboardPageClient from "./DashboardPageClient";

export const metadata = {
  title: "Member Dashboard | JPSPARE",
  description: "Manage your JPSPARE account, orders, and shipments.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
