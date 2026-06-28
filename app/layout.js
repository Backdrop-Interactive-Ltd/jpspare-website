import "./globals.css";
import PublicChrome from "./PublicChrome";
import CompareFloatingPanel from "./CompareFloatingPanel";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var storedMode = localStorage.getItem("jpspare-theme-mode");
                  var mode = storedMode === "dark" || storedMode === "light" ? storedMode : "light";
                  var isDark = mode === "dark";
                  document.documentElement.dataset.themeMode = mode;
                  document.documentElement.dataset.theme = isDark ? "dark" : "light";
                } catch (error) {
                  document.documentElement.dataset.themeMode = "light";
                  document.documentElement.dataset.theme = "light";
                }
              })();
            `,
          }}
        />
        {children}
        <PublicChrome />
        <CompareFloatingPanel />
      </body>
    </html>
  );
}
