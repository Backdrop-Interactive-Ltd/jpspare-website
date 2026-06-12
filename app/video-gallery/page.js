import VideoGallery from "../VideoGallery";

export const metadata = {
  title: "Video Gallery | JPSPARE",
  description: "Watch JPSPARE product reviews, customer testimonials, tutorials, and latest video updates.",
};

export default function VideoGalleryPage() {
  return (
    <main className="min-h-screen bg-[#070b12]">
      <VideoGallery />
    </main>
  );
}
