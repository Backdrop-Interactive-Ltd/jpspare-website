import VideoGallery from "../VideoGallery";
import TopDealBar from "../TopDealBar";
import { Header } from "../page";

export const metadata = {
  title: "Video Gallery | JPSPARE",
  description: "Watch JPSPARE product reviews, customer testimonials, tutorials, and latest video updates.",
};

export default function VideoGalleryPage() {
  return (
    <>
      <TopDealBar />
      <Header />
      <main className="min-h-screen bg-[#f4f6f8]">
        <VideoGallery />
      </main>
    </>
  );
}
