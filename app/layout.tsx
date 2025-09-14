import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auspicious Time - Cosmic Guidance",
  description: "Discover the most auspicious times for your important activities using ancient Vedic wisdom combined with modern precision. Let the cosmos guide your decisions."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
