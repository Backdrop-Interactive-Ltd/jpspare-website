import "./globals.css";
import SiteFooter from "./SiteFooter";
import BackToTopButton from "./BackToTopButton";

export const metadata = {
  title: "JPSPARE | Premium Auto Parts & Accessories",
  description: "Shop demo premium auto parts and accessories for Japanese vehicles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <SiteFooter />
        <BackToTopButton />
      </body>
    </html>
  );
}
