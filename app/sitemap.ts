import type { MetadataRoute } from "next";
import { FOUNDATIONS_PATH, LIVE_TOPICS, topicHref } from "@/lib/foundations";

const BASE = "https://benliyski.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/blog", "/vocabulary", FOUNDATIONS_PATH, "/projects", "/projects/ai-canvas", "/about"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p === "/" ? "" : p}` })),
    ...LIVE_TOPICS.map((t) => ({ url: `${BASE}${topicHref(t.slug)}` })),
  ];
}
