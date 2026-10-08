import type { Metadata } from "next";
import { Overview } from "@/components/overview";
export const metadata: Metadata = {
  // The root layout's title template only applies to child segments, so
  // this page spells out the full title itself.
  title: { absolute: "Research Overview | AI Backtest Lab Demo" },
  alternates: { canonical: "https://demo.aibacktestlab.com/" },
};
export default function Home() {
  return <Overview />;
}
