import type { Metadata } from "next";
import { Instrument_Serif, DM_Mono, Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";
import CursorEffect from "@/components/pwa/CursorEffect";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
});

const barlow = Barlow({
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CricketPulse — IPL Live",
  description: "Experience live cricket like never before. Predict ball-by-ball outcomes, earn points, and compete on the live leaderboard.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CricketPulse",
  },
};

export const viewport = {
  themeColor: "#C8271A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${dmMono.variable} ${barlowCondensed.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--ink)] text-[var(--ink)] font-sans relative overflow-x-hidden">
        <CursorEffect />
        <main className="flex-1 flex flex-col w-full min-h-screen relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
