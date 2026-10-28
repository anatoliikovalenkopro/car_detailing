import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = {
  title: `${BRAND.full} — ${BRAND.tagline}`,
  description:
    "Premium mobile car detailing in Edmonton, St. Albert, Sherwood Park and area. Book online, get an AI photo quote, and track your detailer live.",
  openGraph: { title: BRAND.full, description: BRAND.tagline, type: "website" },
};

export const viewport: Viewport = { themeColor: "#05070d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
