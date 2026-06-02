import "./globals.css";
import PublicChrome from "./PublicChrome";
import { Inter } from "next/font/google";

const topDealFont = Inter({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-top-deal",
});

export const metadata = {
  title: "JPSPARE | Premium Auto Parts & Accessories",
  description: "Shop demo premium auto parts and accessories for Japanese vehicles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full antialiased ${topDealFont.variable}`}>
      <body className="min-h-full flex flex-col">
        {children}
        <PublicChrome />
      </body>
    </html>
  );
}
