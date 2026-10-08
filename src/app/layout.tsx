import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DemoProvider } from "@/components/demo-context";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://demo.aibacktestlab.com"),
  title: {
    default: "AI Backtest Lab | Interactive Research Demo",
    template: "%s | AI Backtest Lab Demo",
  },
  description:
    "Explore an interactive quantitative research workflow with clearly labeled synthetic charts, sample trades and a planned Claude analysis preview.",
  robots: { index: false, follow: true },
  icons: { icon: "/favicon.ico" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${mono.variable}`}>
      <body>
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
