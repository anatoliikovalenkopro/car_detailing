import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${BRAND.full} — ${BRAND.tagline}`,
  description:
    "Mobile car detailing in Edmonton, St. Albert, Sherwood Park and area. See prices, get a quote from photos, and book in a minute.",
  openGraph: { title: BRAND.full, description: BRAND.tagline, type: "website" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
