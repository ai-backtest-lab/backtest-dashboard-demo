import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/analysis/", "/claude/"].map((path) => ({
    url: "https://demo.aibacktestlab.com" + path,
  }));
}
