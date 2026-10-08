import type { Metadata } from "next";
import { ClaudePreview } from "@/components/claude-preview";
export const metadata: Metadata = {
  title: "Planned Claude Analysis Preview",
  alternates: { canonical: "https://demo.aibacktestlab.com/claude/" },
};
export default function Page() {
  return <ClaudePreview />;
}
