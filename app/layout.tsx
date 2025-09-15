import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auspicious Time - Cosmic Guidance",
  description:
    "Discover the most auspicious times for your important activities using ancient Vedic wisdom combined with modern precision. Let the cosmos guide your decisions.",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Auspicious Time",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
