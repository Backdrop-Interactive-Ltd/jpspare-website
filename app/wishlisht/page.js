import WishlistPageClient from "./WishlistPageClient";
import { Header } from "../page";

export const metadata = {
  title: "My Wishlist | JPSPARE",
  description: "Your saved JPSPARE products and favorite auto parts.",
};

export default function WishlistPage() {
  return (
    <>
      <Header />
      <WishlistPageClient />
    </>
  );
}
