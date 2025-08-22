import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Time Advisor",
  description: "Check if your chosen time is favorable and get better alternatives."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
