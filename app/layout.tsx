import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreaX - Form Habits",
  description: "Track your 100-day consistency challenge with StreaX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased bg-zinc-950 text-zinc-100 min-h-screen selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
