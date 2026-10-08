import type { Metadata } from "next";
import { Analysis } from "@/components/analysis";
export const metadata: Metadata = {
  title: "Backtest Analysis",
  alternates: { canonical: "https://demo.aibacktestlab.com/analysis/" },
};
export default function Page() {
  return <Analysis />;
}
