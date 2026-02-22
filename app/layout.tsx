import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bubble Bliss Cafe | Premium Boba Tea, Iced Tea & Shawarma Delivery",
  description:
    "Welcome to Bubble Bliss Cafe - Your ultimate destination for premium bubble tea, refreshing iced tea, and authentic shawarma. Order online for fast delivery. Handcrafted drinks made fresh daily with premium ingredients.",
  keywords: [
    "boba tea",
    "bubble tea",
    "iced tea",
    "shawarma",
    "cafe",
    "order online",
    "delivery",
  ],
  openGraph: {
    title: "Bubble Bliss Cafe | Premium Bubble Tea & Shawarma",
    description:
      "Experience bliss with our premium boba tea, refreshing iced tea, and authentic shawarma. Order now for fast delivery!",
    url: "https://bubbleblisscafe.com",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
