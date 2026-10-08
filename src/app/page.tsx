import type { Metadata } from "next";
import { Overview } from "@/components/overview";
export const metadata: Metadata = {
  title: "Research Overview",
  alternates: { canonical: "https://demo.aibacktestlab.com/" },
};
export default function Home() {
  return <Overview />;
}
